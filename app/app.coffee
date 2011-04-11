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
	createSession: (player) =>
		session = new Session(player)
		session_key = session.random_key
		console.log session_key
		@sessions_for_facebook_id[player.facebook_id] = session
		@sessions_for_random_key[session_key] = session		
		return session_key
	
	#this should be called when the client sends an authenticate message over dnone. 
	#this must be done before anything else over dnone
	sessionConnected: (random_key, conn, client, emit) ->
		console.log("Session connection started! Connection ID = "+conn.id)
		console.log random_key
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
			
	sessionDisconnected: (conn) ->
		console.log("Session ended! Disconnected ID = "+conn.id)
		
		player = playerForConnection conn
		# notify this player's friends of disconnection
		
		@sessions_for_facebook_id.delete sessions_for_connection[conn].player.facebook_id
		@sessions_for_connection.delete conn
		
	playerForConnection: (conn) ->
		@sessions_for_connection[conn].player

sessionManager = new SessionManager	


## DNode RPC API
exports.createServer = (app) ->
	client = DNode (client, conn) ->
		conn.on 'ready', ->
			# publish 'addPlayer', conn.id
			# #client.addPlayer conn.id
		conn.on 'end', ->
			#sessionManager.sessionDisconnected(conn)
		@subscribe = (auth_token, emit) ->
			console.log auth_token
			sessionManager.sessionConnected auth_token, conn, client, emit
			###
			subs[conn.id] = emit
			conn.on 'end', ->
				publish 'leave', conn.id
				delete subs[conn.id]
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

# creates a new session with the facebook_id and returns a token
exports.setFbUserAndGetToken = (fbUser) ->
	if fbUser
		return sessionManager.createSession fbUser.id
