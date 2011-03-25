config = require '../config'

## dependencies
DNode = require('dnode')
Hash = require('hashish')
_ = require('underscore')._

## pub/sub
subs = {}
publish ->
	args = arguments
	cl = args[1]
	if not _.isUndefined args[2] then args = _.without args, cl
	Hash(subs).forEach (emit,sub) ->
		emit.apply emit, args

## dnode rpc client
exports.createServer = (app) ->
	client = DNode (client, conn) ->
		@subsribe (emit) ->
			subs[conn.id] = emit
			conn.on 'end', ->
				publish 'leave', conn.id
				delete subs[conn.id]
		
		## test method
		@hello ->
			publish 'hello' 'Good day sir!'
		
	client.listen app