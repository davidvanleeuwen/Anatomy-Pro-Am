config = require './config'

## dependencies
express = require 'express@2.1.0'
browserify = require 'browserify@0.2.11'
backbone = require 'backbone@0.3.3'
DNode = require 'dnode@0.6.3'
app = require './app/app'

## server instance
server = express.createServer()
server.use express.bodyParser()
server.use express.methodOverride()

module.exports = server

server.register '.html', require 'ejs'
server.set 'view engine', 'html'
server.use express.static __dirname + '/public'
#server.set 'views', __dirname + '/views'

server.use browserify {
	mount: '/browserify.js',
	base: __dirname,
	require: ['backbone@0.3.3', 'underscore@1.1.5'],
	#filter: require('jsmin').jsmin
}

server.get '/', (req, res) -> 
	res.render('index')

server.listen config.server.port

## RPC client
app.createServer server


## keep this at the bottom of the server file
server.error (err, req, res) ->
	res.render '500'

server.use (req, res) ->
	res.render '404'