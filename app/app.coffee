config = require '../config'

## dependencies
DNode = require 'dnode@0.6.10'
_ = require('underscore@1.1.5')._
Backbone = require 'backbone@0.3.3'
resources  = require '../models/resources'
fbgraph = require 'facebook-graph@0.0.6'

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
		@sendChat = (activity_id, player, message) ->
			#activityManager.current[activity_id].
			sessionManager.publish 'newChat', player_id, message
		# dnode/coffeescript fix:
		@version = config.version
	.listen(app, {transports : 'websocket xhr-multipart xhr-polling htmlfile'.split(' ')})

# creates a new session with the facebook_id and returns a token
exports.setFbUserAndGetToken = (fbUser) ->
	if fbUser
		return sessionManager.createSession fbUser

exports.sessionManager = sessionManager
