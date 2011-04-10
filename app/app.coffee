config = require '../config'

## dependencies
DNode = require 'dnode@0.6.6'
Hash = require 'hashish@0.0.2'
_ = require('underscore@1.1.5')._
Backbone = require 'backbone@0.3.3'
resources  = require '../models/resources'
fbgraph = require 'facebook-graph@0.0.6'

# memory store class for storing it in the memory (update: replace with redis)
class MemoryStore
	constructor: () ->
		@data = {}
	create: (model) ->
		if not model.id
			model.id = model.attributes.id = Date.now()
			@data[model.id] = model
			return model
	set: (model) ->
		@data[model.id] = model
		return model
	get: (model) ->
		if model and model.id
			return @data[model.id]
		else
			return _.values(@data)
	destroy: (model) ->
		delete @data[model.id]
		return model

store = new MemoryStore


# overwrite Backbone's sync, to store it in the memory
Backbone.sync = (method, model, success, error) ->
	switch method
		when "read" then resp = store.get model
		when "create" then resp = store.create model
		when "update" then resp = store.set model
		when "delete" then resp = store.destroy model
	if resp
		success(resp)
	else
		console.log(error)

drawing = new resources.collections.Drawing
players = new resources.collections.Players

## pub/sub
subs = {}
publish = () ->
	args = arguments
	cl = args[1]
	if not _.isUndefined args[2] then args = _.without args, cl
	Hash(subs).forEach (emit, sub) ->
		if sub isnt cl
			emit.apply emit, args

GenerateRandomKey = () ->
	#generate random key for this session
	chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	key_length = 32
	ret = ""
	for x in [0..32]
		rnum = Math.floor(Math.random() * chars.length)
		ret += chars.substring(rnum,rnum+1)

	return ret

class Session
	constructor: (@name, @player) ->
		@random_key = GenerateRandomKey()

class SessionManager
	constructor: (@name) ->
		@sessions_for_connection = {}
		@sessions_for_facebook_id = {}
		@sessions_for_random_key = {}
	
	#call this when the user has done the facebook authentication
	#this returns a random session key that should be used to authenticate the dnode connection	
	createSession = (player) =>
		session = new Session(player)
		session_key = session.random_key
		@sessions_for_facebook_id[player.facebook_id] = session
		@sessions_for_random_key[session_key] = session		
		return session_key
	
	#this should be called when the client sends an authenticate message over dnone. 
	#this must be done before anything else over dnone
	sessionConnected = (random_key, conn, client) ->
		console.log("Session connection started! Connection ID = "+conn.id)
		if random_key in @sessions_for_random_key
			session = @sessions_for_random_key[random_key]
			@sessions_for_connection[conn] = session
			@session.connection = conn
			@session.client = client
						
			# notify this player's friends of disconnection e.g., something like
			# for friend in friends_for_player[player]
			#	@sessions_for_facebook_id[friend_id].client.friendSignedOn @session.person 
		else
			console.log("Session connected started with invalid random_id!!!!")
			
	sessionDisconnected = (conn) ->
		console.log("Session started! Connection ID = "+conn.id)
		
		player = playerForConnection conn
		# notify this player's friends of disconnection
		
		@sessions_for_facebook_id.delete sessions_for_connection[conn].player.facebook_id
		@sessions_for_connection.delete conn
		
	playerForConnection = (conn) ->
		@sessions_for_connection[conn].player
	

sessionManager = new SessionManager	


## DNode RPC API
exports.createServer = (app) ->
	client = DNode (client, conn) ->
		conn.on 'ready', ->
			# publish 'addPlayer', conn.id
			# #client.addPlayer conn.id
		conn.on 'end', ->
			sessionManager.sessionEnded(conn)

		@subscribe = (emit) ->
			subs[conn.id] = emit
			#client.returnID conn.id
			conn.on 'end', ->
				publish 'leave', conn.id
				delete subs[conn.id]
		###
		@setID = (id) ->
			conn.id = id
			client.printID conn.id
		@add = (data, options) ->
			aColl = eval options.type
			aColl.create 
			client.add data, { type: options.type }
		@addPointArray = (data,options) ->
			found = false
			aColl = eval options.type
			aColl.each (m) ->
				actionType = m.get 'actionType'
				if actionType == 4
					found = true
					m.destroy()
			aColl.create(data)
			client.add data, { type: options.type }
		@remove = (data, options) ->
			aColl = eval options.type
			m = aColl.get data
			if m
				m.destroy()
				client.remove data, { type: options.type }
		@removeAll = (options) ->
			aColl = eval options.type
			aColl.each (m) ->
				m.destroy()
				client.removeAll { type: options.type }
		###
		# dnode/coffeescript fix:
		@version = config.version
	.listen(app)
	app.get '/drawing', (req, res) ->
		drawing.fetch {
			success: (data) ->
				res.writeHead 200
				res.end JSON.stringify(data)
			error: (err) ->
				res.writeHead 204
				res.end err
		}
	app.get '/players', (req, res) ->	
		console.log players.length;
		players.fetch {
			success: (data) ->
				res.writeHead 200
				res.end JSON.stringify(data)
			error: (err) ->
				res.writeHead 204
				res.end err
		}
	app.get '/friends', (req, res) ->
		friends.fetch {
			success: (data) ->
				res.writeHead 200
				res.end JSON.stringify(data)
			error: (err) ->
				res.writeHead 204
				res.end err
		}
	
#### temp fix, added callback
exports.setFbUser = (data) ->
	if data
		newUser = {
			playerID: data.id
			name: Date.now()
			avatar: "http://graph.facebook.com/" + data.id + "/picture"
		}
		players.create (newUser)
