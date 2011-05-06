config = require './config'
app = require './app/app'
## dependencies
express = require 'express@2.2.2'
browserify = require 'browserify@0.3.1'
fbgraph = require 'facebook-graph@0.0.6'
https = require 'https'
fbhelper = require './fbhelper'
app = require './app/app'
Hash = require 'hashish@0.0.2'


## server instance
server = express.createServer()
server.use express.bodyParser()
server.use express.cookieParser()
#server.use express.methodOverride()

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

## RPC client
app.createServer server

server.get '/', (req, res) ->
	console.log '/ post'
	fbhelper.renderIndex req, res, (fbUser) ->
		if fbUser
			# callback for getting the token and returns it to the  original request
			return app.setFbUserAndGetToken fbUser
	
server.post '/', (req, res) ->
	console.log '/ post'
	fbhelper.renderIndex req, res, (fbUser) ->
		if fbUser
			# callback for getting the token and returns it to the  original request
			return app.setFbUserAndGetToken fbUser

server.all '/deleteuser', (req, res) ->
	#required to allow url callback from friends collection - doesn't acctually do anything on this end.
	res.end
server.all '/finishedsignin', (req, res) ->
	console.log 'hit finished sign in'
	res.redirect config.fbconfig.url
	
server.get '/authresponse', (req, res) ->
	console.log('GET @ /authresponse')
	fbhelper.authUser(req, res)

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
server.all '/map', (req, res) ->
	res.sendfile("svn/branches/map-editor/index.html")
	
	
	

server.all '/friends/:activity_id?', (req, res) ->
	playersInfo = app.sessionManager.sessions_for_facebook_id
	output = []
	Hash(playersInfo).forEach (player) ->
		output.push ({
			id: player.fbUser.id,
			name: player.fbUser.first_name,
			player_color: player.fbUser.player_color, 
			avatar: "http://graph.facebook.com/" + player.fbUser.id + "/picture", 
			layer_enabled: false,
			current_case_id: {name: "case name", case_id: 0001}
			})
	res.send(JSON.stringify(output))


## other stuff
###
server.error (err, req, res) ->
	res.render '500'
server.use (req, res) ->
	res.render '404'
###

server.listen config.server.port