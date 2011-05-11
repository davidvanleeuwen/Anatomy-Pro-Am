config = require '../config'

## dependencies
DNode = require 'dnode@0.6.7'
_ = require('underscore@1.1.5')._
Backbone = require 'backbone@0.3.3'
resources  = require '../models/resources'
fbgraph = require 'facebook-graph@0.0.6'

util = require './util'

store = new util.MemoryStore
sessionManager = new util.SessionManager
activityManager = new util.ActivityManager

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
		@sendJoinRequest = (fn, id, player_id) ->
			console.log fn, id, player_id
			sessionManager.sendJoinRequest fn, id, player_id
		@newCase = (case_number, thisPlayer, emit) ->
			returnedValue = activityManager.newActivity case_number, thisPlayer
			emit.apply emit, ['setCurrentCase', returnedValue]
		@getCase = (activity_id) ->
			return activityManager.getActivity(activity_id)
		@pointColored = (activity_id, player_id, points) ->
			for point in points
				activityManager.current[activity_id].createPoint player_id, point
			sessionManager.publish 'pointColored', player_id, points
		@pointErased = (activity_id, player_id, points) ->
			for point in points
				activityManager.current[activity_id].deletePoint player_id, point, (isRemoved) ->
					if isRemoved
						console.log "lets get silly"
			sessionManager.publish 'pointErased', player_id, points
		@getColoredPointsForThisLayerAndPlayer = (activity_id, requester_id, player, layer, emit) ->
			console.log activity_id, requester_id, player, layer, emit
			activityManager.current[activity_id].getPointsForPlayer layer, player, (points) ->
				emit.apply emit, ['setColoredPointsForThisLayer', {player: player, payload: points} ]
		@done = (player_id) -> #yes, this is empty for now - it is connected to the done button in the computer view and will be used eventually

		@joinActivity = (activity_id, player) ->
			activityManager.current[activity_id].addPlayer(activity_id, player)
		
		@find = (client, model) ->
			console.log client
			console.log model
		
		# dnode/coffeescript fix:
		@version = config.version
	.listen(app)

# creates a new session with the facebook_id and returns a token
exports.setFbUserAndGetToken = (fbUser) ->
	if fbUser
		return sessionManager.createSession fbUser

exports.sessionManager = sessionManager
