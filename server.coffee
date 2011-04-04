config = require './config'
express = require 'express@2.2.0'
browserify = require 'browserify@0.3.0'
stylus = require 'stylus@0.10.0'
#fbgraph = require 'facebook-graph@0.0.4'
https = require 'https'
#butil = require './facebookutil.js'
fbhelper = require './fbhelper'
#redirect_uri = 'http://c.apa.dev.mirerca.com/authresponse/'
#scope = 'user_photos,email,user_birthday,user_online_presence,offline_access'

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
	

server.get '/', (req, res) ->
	res.render 'index'
	
server.post '/', (req, res) ->
	console.log("POST @ /")
	fbhelper.renderIndex(req, res)
###	user = fbgraph.getUserFromCookie(req.cookies, config.fbconfig.appId, config.fbconfig.appSecret)
	console.log(user)
	if user
		console.log '-------=== LOGGED IN USER, SENDING INDEX ===-------'
		res.render 'index'
	else
		console.log '-------=== NO USER - RENDERING INDEX TO DIRECT USER TO AUTH PAGE ===-------'
		res.render 'index'
###
server.get '/authresponse', (req, res) ->
	console.log('GET @ /authresponse')
	fbhelper.authUser(req, res)
###
	if req.query.code
		console.log "-------=== USER ACCEPTED TERMS, SENDING ACCESS TOKEN ===-------"
		##compile access token requirements
		path = '/oauth/access_token'
		args = {
			client_id: config.fbconfig.appId
			redirect_uri: redirect_uri
			client_secret: config.fbconfig.appSecret
			code: req.query.code			
		}
		print = (error, code) ->
			if code 
				#if we get the code back, get all user data
				graph = new fbgraph.GraphAPI code
				print = (error, userdata) ->
					if userdata
						fbhelper.store_user(userdata, code)
				graph.getObject 'me', print
		fbutil.auth path, 'GET', args, print
		res.redirect 'http://apps.facebook.com/anatomy_pro-am/'

	if req.query.error_reason	
		fbhelper.userDeclinedAccess(req)
		res.end()
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
	fbhelper.userDeauthed(req)
	res.end()
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