config = require './config'
express = require 'express@2.2.0'
browserify = require 'browserify@0.3.0'
stylus = require 'stylus@0.10.0'
fbgraph = require 'facebook-graph@0.0.4'
https = require 'https'
fbutil = require './facebookutil.js'
redirect_uri = 'http://c.apa.dev.mirerca.com/authresponse/'
scope = 'user_photos,email,user_birthday,user_online_presence,offline_access'

## server instance
server = express.createServer()
server.use express.bodyParser()
server.use express.cookieParser()
#server.use express.methodOverride()

#module.exports = server

server.register '.html', require 'ejs'
server.set 'view engine', 'html'
server.use express.static __dirname + '/public'
server.set 'views', __dirname + '/views'
###
server.use browserify {
	mount: '/browserify.js',
	base: __dirname,
	require: ['backbone@0.3.3', 'underscore@1.1.5'],
	#filter: require('jsmin').jsmin
}
###

server.post '/', (req,res) ->
	console.log(" / POST")
	user = fbgraph.getUserFromCookie(req.cookies, config.fbconfig.appId, config.fbconfig.appSecret)
	console.log(user)
	if user
		console.log '-------=== LOGGED IN USER, SENDING FRIENDS ===-------'
		graph = new fbgraph.GraphAPI user['access_token']
		print = (error, data) ->
			console.log ''
			res.send (data)
		graph.getConnections 'me', 'friends', print
	else
		console.log '-------=== NO USER - RENDERING INDEX TO DIRECT USER TO AUTH PAGE ===-------'
		res.render 'index'

server.get '/authresponse', (req, res) ->
	console.log('get auth')
	outputtext = ""
	if req.query.code
		console.log "-------=== USER ACCEPTED TERMS, SENDING ACCESS TOKEN ===-------"
		path = '/oauth/access_token'
		args = {
			client_id: config.fbconfig.appId
			redirect_uri: redirect_uri
			client_secret: config.fbconfig.appSecret
			code: req.query.code			
		}
		print = (error, data) ->
			if data 
				graph = new fbgraph.GraphAPI data
				print = (error, data) ->
					if data
						outputtext = data
						console.log data
				graph.getConnections 'me', 'friends', print
		fbutil.auth path, 'GET', args, print
		if outputtext
			res.send(outputtext)
		else
			res.end()
		#res.redirect 'http://apps.facebook.com/anatomy_pro-am/'


	if req.query.error_reason	
		console.log "-------=== USER DENIED TERMS ===-------"
		console.log(req.query.error_reason)
		console.log(req.query.error)
		console.log(req.query.error_description)
		res.end()
		###
		server.get '/', (req,res) ->
			console.log("GET")
			#res.render 'index'
			res.send("/ get")
		###

##Used to send privacy policy information.  
server.all '/privacy', (req, res) ->
	console.log("privacy")
	console.log(req.method)
	res.send("PRIVACY POLICY")
##Used to send terms of service information. 
server.all '/tos', (req, res) ->
	console.log("tos")
	console.log(req.method)
	res.send("TERMS OF SERVICE")
##Used to send "App Tab" information - Don't really know what this is yet.
server.all '/tab', (req, res) ->
	console.log("tab")
	console.log(req.method)
	res.send("TAB")
##Used when someone stops using the application
server.post '/deauth', (req, res) ->
	console.log("-------=== USER REMOVED APP! ===-------")
	console.log(req)
	res.send("DEAUTHED")
###
server.get '/', (req, res) -> 
	res.render('index')

server.error (err, req, res) ->
	res.render '500'

server.use (req, res) ->
	res.render '404'

###	
server.listen config.server.port

## RPC client
###
app = require './app/app'
app.createServer server
###