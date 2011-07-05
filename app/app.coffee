config = require '../config'
fbhelper = require '../fbhelper'

## dependencies
DNode = require 'dnode@0.6.10'
_ = require('underscore@1.1.5')._
Backbone = require 'backbone@0.3.3'
resources  = require '../models/resources'
sanitizer = require 'sanitizer@0.0.14'

util = require './util'

store = new util.MemoryStore
sessionManager = new util.SessionManager
activityManager = new util.ActivityManager
flush = util.flushDatabase

## DNode RPC API
exports.createServer = (app) ->
	client = DNode (client, conn) ->
		@login = (pw, emit) ->
			if pw is ''
				emit.apply emit, ['Continue']
			if pw is 'AdminPanel33!'
				emit.apply emit, ['AdminPanel']
		@subscribe = (auth_token, emit) ->
			session = sessionManager.sessionConnected auth_token, conn, client, emit
			emit.apply emit, ['myINFO', session.fbUser, session.player_color]
			sessionManager.publishToAll 'FriendCameOnline', session.fbUser
		conn.on 'end', ->
			session = sessionManager.sessionDisconnected conn
			sessionManager.publishToAll 'FriendWentOffline', session.fbUser
		@sendJoinRequest = (fn, id, player_id, player_name, player_avatar) ->
			console.log (id + " " + player_id + " " + player_name + " " + player_avatar)
			caseNum = activityManager.current[id].getCaseID()
			console.log caseNum
			sessionManager.sendJoinRequest fn, id, caseNum, player_id, player_name, player_avatar
		@newCase = (case_number, thisPlayer, emit) ->
			returnedValue = activityManager.newActivity case_number, thisPlayer
			sessionManager.setActivity thisPlayer, returnedValue
			emit.apply emit, ['setCurrentCase', case_number, returnedValue]
			sessionManager.publishToAll 'PlayerStartedCase', thisPlayer, returnedValue
		@getCase = (activity_id) ->
			return activityManager.current[activity_id].getCaseID
		@pointColored = (activity_id, player_id, points) ->
			players = activityManager.current[activity_id].getPlayers()
			for point in points
				activityManager.current[activity_id].createPoint player_id, point
				sessionManager.publishToActivity players, 'pointColored', player_id, points
		@pointErased = (activity_id, player_id, points) ->
			players = activityManager.current[activity_id].getPlayers()
			for point in points
				activityManager.current[activity_id].deletePoint player_id, point
				sessionManager.publishToActivity players, 'pointErased', player_id, points
		@clearCanvas = (activity_id, player_id, layer) ->
			activityManager.current[activity_id].clearCanvas player_id, layer
			players = activityManager.current[activity_id].getPlayers()
			sessionManager.publishToActivity players, 'canvasCleared', player_id, layer
		@getColoredPointsForThisLayerAndPlayer = (activity_id, requester_id, player, layer, emit) ->
			activityManager.current[activity_id].getPointsForPlayer layer, player, (points) ->
				emit.apply emit, ['setColoredPointsForThisLayer', {player: player, payload: points} ]
		@done = (activity_id, player, tumorHit, healthyHit) ->
			players = activityManager.current[activity_id].getPlayers()
			sessionManager.publishToActivity players, 'playerIsDone', player
			console.log players, player
			activityManager.current[activity_id].playerDone player, tumorHit, healthyHit, (result) ->
				if result == true
					sessionManager.publishToActivity players, 'everyoneIsDone', player
		@notDone = (activity_id, player) ->
			players = activityManager.current[activity_id].getPlayers()
			activityManager.current[activity_id].playerNotDone player
			sessionManager.publishToActivity players, 'playerNotDone', player
		@getScores = (activity_id, player) ->
			players = activityManager.current[activity_id].getPlayers()
			sessionManager.publishToActivity players, 'playerSubmitted', player
			activityManager.current[activity_id].getScores player, (returned) ->
				console.log returned
				if returned.result == true
					sessionManager.publishToActivity players, 'allScores', returned
		@joinActivity = (activity_id, player) ->
			activityManager.current[activity_id].addPlayer(player)
			sessionManager.setActivity player, activity_id
			sessionManager.publishToAll 'PlayerStartedCase', player, activity_id
		@sendChat = (activity_id, player_id, layer, message) ->
			message = sanitizer.escape message
			activityManager.current[activity_id].addChatMessage player_id, message
			players = activityManager.current[activity_id].getPlayers()
			sessionManager.publishToActivity players, 'newChat', player_id, layer, message
		@setGoalPointsForCaseAndLayer = (activity_id, layer_ID, goalPoints) ->
			activityManager.current[activity_id].setGoalPointsForCaseAndLayer layer_ID, goalPoints
		@getScoreForCase = (activity_id, player, width, height, emit) ->
			activityManager.current[activity_id].getLayerCountForCase (layerCount) ->
				totalCaseScore = {'tumorHit': 0, 'healthyHit': 0}
				_.each( _.range(layerCount), (layer_ID) ->
					activityManager.current[activity_id].getScoreForCaseAndLayer player.id, width, height, layer_ID, (caseScore) ->
						totalCaseScore['tumorHit'] += caseScore['tumorHit']
						totalCaseScore['healthyHit'] += caseScore['healthyHit']
						players = activityManager.current[activity_id].getPlayers()
						sessionManager.publishToActivity players, 'playerIsDone', player
						activityManager.current[activity_id].playerDone player, caseScore.tumorHit, caseScore.healthyHit, (result) ->
							if result == true
								sessionManager.publishToActivity players, 'everyoneIsDone', player
						if layer_ID is layerCount - 1
							totalCaseScore['tumorHit'] /= layerCount
							totalCaseScore['healthyHit'] /= layerCount
							console.log 'this is the final case score'
							console.log totalCaseScore
							emit.apply emit, ['setScoreForCase', {payload: caseScore}]
				)
		@getChatHistoryForActivity = (activity_id, emit) ->
			activityManager.current[activity_id].getChatHistoryForActivity (chats) ->
				emit.apply emit, ['setChatHistory', {payload: chats}]
		@getOnlineFriends = (uid, emit) ->
			fbhelper.getOnlineFriends uid, (cb) ->
				emit.apply emit, ['setAllFriends', {payload:cb}]
		@appRequest = (myid, yourid) ->
			fbhelper.appRequest myid, yourid
		@cursorPosition = (activity_id, player, layer, position) ->
			players = activityManager.current[activity_id].getPlayers()
			sessionManager.publishToActivity players, 'newCursorPosition', player, layer, position
		@getColor = (activity_id, player_id, emit) ->
			activityManager.current[activity_id].getColor player_id, (color) ->
				sessionManager.sessions_for_facebook_id[player_id].fbUser.player_color = color
				emit.apply emit, ['setColor', {payload:color}]
		@leftActivity = (activity_id, player) ->
			activityManager.current[activity_id].removePlayer player.id 
			sessionManager.setActivity player, 0
			players = activityManager.current[activity_id].getPlayers()
			sessionManager.publishToActivity players, 'playerLeft', player

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
