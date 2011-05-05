config = require './config'
app = require './app/app'
## dependencies
express = require 'express@2.2.2'
browserify = require 'browserify@0.3.1'
fbgraph = require 'facebook-graph@0.0.6'
https = require 'https'
http = require 'http'
httpClient = require './public/javascripts/httpclient.js'
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
	console.log('GET @ /')
	fbhelper.renderIndex

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
	console.log '**********************************hit finished sign in'
	res.redirect config.fbconfig.url
	
server.get '/authresponse', (req, res) ->
	console.log('GET @ /authresponse')
	fbhelper.authresponse(req, res)

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
server.all '/deauth:a?', (req, res) ->
	fbhelper.userDeauthed(req, res)
	#res.end()
	
#used to get all players given the activity_id they currently have.  
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

server.all '/test:a?', (req, res) ->
	inData = ({ 
	id: '511366798',
	name: 'Jake Ruesch',
	first_name: 'Jake',
	last_name: 'Ruesch',
	link: 'http://www.facebook.com/jake.ruesch',
	username: 'jake.ruesch',
	birthday: '08/29/1987',
	hometown:{ id: '108341582521365', name: 'Wisconsin Rapids, Wisconsin' },
	location: { id: '107572595931951', name: 'Madison, Wisconsin' },
	sports: [ { id: '106011416097502', name: 'Ice hockey' } ],
	favorite_teams: [ { id: '71671905072', name: 'Green Bay Packers' },
	{ id: '78722009582', name: 'New Jersey Devils' },
	{ id: '107402292615812', name: 'Minnesota Wild' },
	{ id: '45083850002', name: 'Milwaukee Brewers' } ],
	favorite_athletes: 	[ { id: '111500102200037', name: 'Clay Matthews III' },
	{ id: '112169405467151', name: 'Donald Driver' },
	{ id: '106080419423961', name: 'Aaron Rodgers' },
	{ id: '108542475836957', name: 'Alexander Ovechkin' },
	{ id: '103121619727630', name: 'Zach Parise' },
	{ id: '107899805905299', name: 'Martin Brodeur' } ],
	education: 	[ { school: [Object], year: [Object], type: 'College' },
	{ school: [Object],
	year: [Object],
	type: 'High School' } ],
	gender: 'male',
	email: 'ruesch_27@hotmail.com',
	timezone: -5,
	locale: 'en_US',
	verified: true,
	updated_time: '2011-04-16T03:17:02+0000',
	player_color: 'FFCC00' }
	)

	result = fbhelper.addUser inData
	res.send (result)

## other stuff
###
server.error (err, req, res) ->
	res.render '500'
server.use (req, res) ->
	res.render '404'
###

server.listen config.server.port