## dependencies
config = require './config'
express = require 'express@2.1.0'
browserify = require 'browserify@0.2.11'
stylus = require 'stylus@0.10.0'

## server instance
server = express.createServer()
server.use express.bodyParser()
server.use express.methodOverride()

server.register '.html', require 'ejs'
server.set 'view engine', 'html'
server.use express.static __dirname + '/public'
server.set 'views', __dirname + '/views'

server.use browserify ->
	mount: '/browserify.js',
	base: __dirname,
	require: ['events']

server.get '/', (req, res) -> 
	res.render 'index'

server.error (err, req, res) ->
	res.render '500'

server.use (req, res) ->
	res.render '404'

server.listen config.server.port

## RPC client
app = require './app/app'
app.createServer server