config = require '../config'

Hash = require 'hashish@0.0.2'
_ = require('underscore@1.1.5')._
redis = require 'redis@0.5.11'

###
#	SESSION MANAGER
###

colors = [ 
	{ hex: '3D5A9C', user: undefined },
	{ hex: '91E671', user: undefined },
	{ hex: '66993C', user: undefined },
	{ hex: 'E9B061', user: undefined },
	{ hex: 'E73237', user: undefined },
	{ hex: 'FF0000', user: undefined },
	{ hex: 'FFFF00', user: undefined },
	{ hex: 'FF00FF', user: undefined },
	{ hex: '00FF00', user: undefined },
	{ hex: '00FFFF', user: undefined },
	{ hex: '0000FF', user: undefined } 
]



GetColor = (userID) ->
	returnedcolor = 'asdf'
	assigned = false
	_.each colors, (color) ->
		if assigned is false
			if color.user is undefined 
				returnedcolor = color.hex
				color.user = userID
				assigned = true
			else
				returnedcolor = 'no avaialble'
	console.log colors
	return returnedcolor
	
UnsetColor = (userID) ->
	console.log "disconnect uid: " +  userID
	_.each colors, (color) ->
		if color.user is userID[0]
			console.log "Returning color " + color.user
			color.user = undefined
		
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
	constructor: (@facebook_id, @fbUser) ->
		@random_key = GenerateRandomKey()
		@connection = ''
		@client = ''

class SessionManager
	constructor: (@id, @player) ->
		@sessions_for_connection = {}
		@sessions_for_facebook_id = {}
		@sessions_for_random_key = {}
	
	#call this when the user has done the facebook authentication
	#this returns a random session key that should be used to authenticate the dnode connection
	createSession: (player) =>
		session = new Session(player.id, player)
		session_key = session.random_key
		@sessions_for_facebook_id[player.id] = session
		player.player_color = GetColor(player.id)
		@sessions_for_random_key[session_key] = session		
		return session_key
	
	#this should be called when the client sends an authenticate message over dnone. 
	#this must be done before anything else over dnone
	sessionConnected: (random_key, conn, client, emit) ->
		console.log("Session connection started! Connection ID = " + conn.id)
		if @sessions_for_random_key[random_key]
			session = @sessions_for_random_key[random_key]
			@sessions_for_connection[conn.id] = session
			session.connection = conn
			session.client = client
			session.emit = emit
			
			return session
		else
			console.log("Session connected started with invalid random_id!!!!")
			
	sessionDisconnected: (conn) ->
		console.log("Session ended! Disconnected ID = " + conn.id)
		UnsetColor([@sessions_for_connection[conn.id].facebook_id])
		
		session_conn = @sessions_for_connection[conn.id]
		
		delete @sessions_for_facebook_id[@sessions_for_connection[conn.id].facebook_id]
		delete @sessions_for_connection[conn.id]
		
		return session_conn
	
	publish: () ->
		args = arguments
		Hash(@sessions_for_connection).forEach (player) ->
			player.emit.apply player.emit, args
			
	sendJoinRequest: () ->
		args = arguments
		Hash(@sessions_for_connection).forEach (player) ->
			if player.facebook_id is args[2]
				player.emit.apply player.emit, args

	
	playerForConnection: (conn) ->
		@sessions_for_connection[conn.id].player

###
#	CONTOURING ACTIVITY
###
class ActivityManager
	constructor: () ->
		@current = []
	newActivity: (case_number, thisPlayer) ->
		activity = new ContouringActivity
		activity.addPlayer thisPlayer
		activity.setCaseID case_number
		@current[activity.id] = activity	
		return activity.id

		
class ContouringActivity
	constructor: () ->
		@id = 0  #Changed to zero for now to allow multiple people in one room #GenerateRandomKey()
		@activityData = new ContouringActivityData(@id)
		@players = {}
	getID: () ->
		return @id
	setCaseID: (case_id) ->
		@caseID = case_id
	addPlayer: (player) ->
		@players[player.id] = player
	getPlayers: (player) ->
		return @players;
	createPoint: (player_id, point) ->
		@activityData.newPoint  player_id, point
	deletePoint: (player_id, point, callback) ->
		return @activityData.removePoint player_id, point, callback
	getPointsForPlayer: (layer, player_id, callback) ->
		return @activityData.getPointsForPlayer layer, player_id, callback
		

###
#	CONTOURING ACTIVTY DATA
###
class ContouringActivityData
	constructor: (@id) ->
		@redisClient = redis.createClient config.redis.port, config.redis.server
		@redisClient.select config.redis.db
	newPoint: (player_id, point) ->
		client = @redisClient
		thisID = @id
		client.sismember 'activity:'+thisID+':layer:'+point.layer+':player:'+player_id+':points', JSON.stringify({point}), (err, ismember) ->
			if err then console.log 'SISMEMBER error: ', err
			if ismember is 0
				client.sadd 'activity:'+thisID+':layer:'+point.layer+':player:'+player_id+':points', JSON.stringify({point}), (err, added) ->
					if err then console.log 'SADD error: ', err
	removePoint: (player_id, point, callback) ->
		thisID = @id
		@redisClient.srem 'activity:'+thisID+':layer:'+point.layer+':player:'+player_id+':points', JSON.stringify({point}), (err, isremoved) ->
			if err then console.log 'SISMEMBER error: ', err
			console.log "erase Attempt: ", thisID, player_id, JSON.stringify({point}) + isremoved
			callback isremoved
	getPointsForPlayer: ( layer, player, callback) ->
		@redisClient.smembers 'activity:'+@id+':layer:'+layer+':player:'+player+':points', (err, points) ->
			if err then console.log 'SMEMBERS error: ', err
			data = []
			_.each points, (point) ->
				data.push JSON.parse point
			console.log "Returned Points: ", points
			callback data

###
#	MEMORY STORE
###

# memory store class for storing it in the memory (update: replace with redis)
class MemoryStore
	constructor: () ->
		@data = {}
	create: (model) ->
		if not model.id
			model.id = model.attributes.id = @guid
			@data[model.id] = model
			return model
	update: (model) ->
		@data[model.id] = model
		return model
	find: (model) ->
		if model and model.id
			return @data[model.id]
	findAll: () ->
		return _.values(@data)
	destroy: (model) ->
		delete @data[model.id]
		return model
	S4: () ->
		return (((1+Math.random())*0x10000)|0).toString(16).substring(1)
	guid: () ->
		return (@S4()+@S4()+"-"+@S4()+"-"+@S4()+"-"+@S4()+"-"+@S4()+@S4()+@S4())		

exports.SessionManager = SessionManager
exports.MemoryStore = MemoryStore
exports.ActivityManager = ActivityManager