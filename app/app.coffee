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
activityManager = new util.ContouringActivity

## DNode RPC API
exports.createServer = (app) ->
	client = DNode (client, conn) ->
		@subscribe = (auth_token, emit) ->
			session = sessionManager.sessionConnected auth_token, conn, client, emit
			emit.apply emit, ['myUID', session.facebook_id]
			sessionManager.publish 'FriendCameOnline', session.fbUser
		conn.on 'end', ->
			session = sessionManager.sessionDisconnected conn
			sessionManager.publish 'FriendWentOffline', session.fbUser
		@pointColored = (player_id, point) ->
			activityManager.createPoint player_id, point
			sessionManager.publish 'pointColered', player_id, point
		@stopColoring = (player_id) ->
			sessionManager.publish 'stopColoring', player_id
		@pointErased = (player_id, point) ->
			activityManager.deletePoint player_id, point
			sessionManager.publish 'pointErased', player_id, point
			
		# dnode/coffeescript fix:
		@version = config.version
	.listen(app)

# creates a new session with the facebook_id and returns a token
exports.setFbUserAndGetToken = (fbUser) ->
	if fbUser
		return sessionManager.createSession fbUser
