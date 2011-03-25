## dependencies
config = require '../config'
express = require 'express'
browserify = require 'browserify'

## server instance
server = express.createServer();
server.use express.static('./public')
server.use browserify ->
	mount: '/require.js',
	main: require('events')
server.get '/', (req, res) -> 
	res.render()
server.listen config.server.port

## RPC client
app = require '../app/app'
app.createServer server