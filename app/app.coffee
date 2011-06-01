config = require '../config'
fbhelper = require '../fbhelper'

## dependencies
DNode = require 'dnode@0.6.10'
_ = require('underscore@1.1.5')._
Backbone = require 'backbone@0.3.3'
resources  = require '../models/resources'

util = require './util'

store = new util.MemoryStore
sessionManager = new util.SessionManager
activityManager = new util.ActivityManager
flush = util.flushDatabase

## DNode RPC API
exports.createServer = (app) ->
	client = DNode (client, conn) ->
		@login = (pw, emit) ->
			if pw is 'tumor'
				emit.apply emit, ['Continue']
		@subscribe = (auth_token, emit) ->
			session = sessionManager.sessionConnected auth_token, conn, client, emit
			emit.apply emit, ['myINFO', session.fbUser, session.player_color]
			sessionManager.publish 'FriendCameOnline', session.fbUser
		conn.on 'end', ->
			session = sessionManager.sessionDisconnected conn
			sessionManager.publish 'FriendWentOffline', session.fbUser
		@sendJoinRequest = (fn, id, player_id, player_name, player_avatar) ->
			sessionManager.sendJoinRequest fn, id, player_id, player_name, player_avatar
		@newCase = (case_number, thisPlayer, emit) ->
			returnedValue = activityManager.newActivity case_number, thisPlayer
			sessionManager.setActivity thisPlayer, returnedValue
			emit.apply emit, ['setCurrentCase', returnedValue]
			sessionManager.publish 'PlayerStartedCase', thisPlayer, returnedValue
		@getCase = (activity_id) ->
			return activityManager.getActivity(activity_id)
		@pointColored = (activity_id, player_id, points) ->
			for point in points
				activityManager.current[activity_id].createPoint player_id, point
			sessionManager.publish 'pointColored', player_id, points
		@pointErased = (activity_id, player_id, points) ->
			for point in points
				activityManager.current[activity_id].deletePoint player_id, point
			sessionManager.publish 'pointErased', player_id, points
		@getColoredPointsForThisLayerAndPlayer = (activity_id, requester_id, player, layer, emit) ->
			activityManager.current[activity_id].getPointsForPlayer layer, player, (points) ->
				emit.apply emit, ['setColoredPointsForThisLayer', {player: player, payload: points} ]
		@done = (player_id) -> 
		    #yes, this is empty for now - it is connected to the done button in the computer view and will be used eventually
		@joinActivity = (activity_id, player) ->
			activityManager.current[activity_id].addPlayer(activity_id, player)
			sessionManager.setActivity player, activity_id
			sessionManager.publish 'PlayerStartedCase', player, activity_id
		@sendChat = (activity_id, player_id, message) ->
			activityManager.current[activity_id].addChatMessage player_id, message
			sessionManager.publish 'newChat', player_id, message
		@getChatHistoryForActivity = (activity_id, emit) ->
			activityManager.current[activity_id].getChatHistoryForActivity (chats) ->
				emit.apply emit, ['setChatHistory', {payload: chats}]
		@getOnlineFriends = (uid, emit) ->
			fbhelper.getOnlineFriends uid, (cb) ->
				emit.apply emit, ['setAllFriends', {payload:cb}]
		@appRequest = (myid, yourid) ->
			fbhelper.appRequest myid, yourid
		# dnode/coffeescript fix:
		@version = config.version
	.listen {
        protocol : 'socket.io',
        server : app,
        transports : 'websocket flashsocket xhr-polling '.split(/\s+/),
	}

# creates a new session with the facebook_id and returns a token
exports.setFbUserAndGetToken = (fbUser) ->
	if fbUser
		return sessionManager.createSession fbUser

exports.sessionManager = sessionManager
