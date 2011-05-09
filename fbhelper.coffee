config = require './config'
fbgraph = require 'facebook-graph@0.0.6'
fbutil = require './facebookutil.js'
http = require 'http'
color = require('./color.js').set
httpClient = require './public/javascripts/httpclient.js'

Hash = require 'hashish@0.0.2'

storeUser = (userData, userCode) ->
	##Will store user to DB.  
	console.log("StoreUserData", userData, userCode)
	addUser (userData);
	

	
userDeauthed = (reqInfo) ->
	#do something with deauthed user info
	console.log("-------=== USER REMOVED APP! ===-------")
	console.log (reqInfo)
	console.log("-------=== USER REMOVED APP! ===-------")

userDeclinedAccess = (reqInfo) ->
	#so something when a user declines using the app from the access window
	console.log "-------=== USER DENIED TERMS ===-------"
	console.log(req.query.error_reason)
	console.log(req.query.error)
	console.log(req.query.error_description)

authUser = (req, res) ->
	if req.query.code
		console.log "-------=== USER ACCEPTED TERMS, SENDING ACCESS TOKEN ===-------"
		##compile access token requirements
		path = '/oauth/access_token'
		args = {
			client_id: config.fbconfig.appId
			redirect_uri: config.fbconfig.redirect_uri
			client_secret: config.fbconfig.appSecret
			code: req.query.code			
		}
		print = (error, code) ->
			if code 
				#if we get the code back, get all user data
				graph = new fbgraph.GraphAPI code
				printFbObject = (error, userdata) ->
					# getting error: Invalid access token signature.
					if userdata
						storeUser(userdata, code)
				# doesn't work?
				graph.getObject 'me', printFbObject
		fbutil.auth path, 'GET', args, print
		res.redirect config.fbconfig.signedup
	if req.query.error_reason	
		userDeclinedAccess(req)
		res.end()

renderIndex =  (req, res, getToken) ->
	user = fbgraph.getUserFromCookie(req.cookies, config.fbconfig.appId, config.fbconfig.appSecret)
	# req.cookie is empty (so no user is set), that's why it's refreshing constantly
	if user
		graph = new fbgraph.GraphAPI user.access_token
		graph.getObject 'me', (error, data) ->
			if error
				console.log 'fbhelper error: ', error
				res.render 'auth', {fb: config.fbconfig}
			else
				token = getToken data
				if token
					storeUser data, user.access_token #should add the users info everytime they log in.  
					# should the render be in here or in the server.coffee?
					res.render 'index', {fb: config.fbconfig, token: token}
		graph = new fbgraph.GraphAPI user.access_token
		#console.log user
		graph.getConnections 'me','friends', (error, data) ->
			if error
				console.log 'fbhelper error: ', error
			else
				addMyFriends data, user.uid
	else
		console.log '-------=== NO USER - RENDERING INDEX TO DIRECT USER TO AUTH PAGE ===-------'
		res.render 'auth', {fb: config.fbconfig}

addMyFriends = (d, myID) ->
	#console.log d, myID
	Hash(d.data).forEach (friend) ->
		#addUser friend
		
getFriends = (uid) ->
	dbPath = '/users/' + uid + '/friends.json'
	client = new httpClient.httpclient
	client.perform config.sql.fullHost + dbPath, "GET", (res) ->
		result = res.response.body
		console.log result
		return result
	
addUser = (info) ->
	console.log info.id
	dbPath = '/facebook_users/uid/' + info.id + '.json'
	client = new httpClient.httpclient
	result = ''
	client.perform config.sql.fullHost + dbPath, "GET", (res) ->
		if res.response.status is 500
			console.log color '---------------- USER DOES NOT EXIST - CREATING -------------------\n', 'green'
			postData = formatUser info
			dbPath = '/facebook_users.json'
			client2 = new httpClient.httpclient
			client2.perform config.sql.fullHost + dbPath, "POST", (resp) -> 
				result = resp.response.body
				console.log color '---------------- RESULT OF ADDING USER -------------------\n', 'green'
				console.log result.response.body.facebook_user.id	
			,postData
		else 
			result = color '------------------- USER ALREADY EXISTS -------------------\n', 'green'
			result += JSON.parse(res.response.body).facebook_user.id + " - " + JSON.parse(res.response.body).facebook_user.first_name + " " + JSON.parse(res.response.body).facebook_user.last_name
		console.log '\n********************\n\naddUser Result: \n\n' + result + '\n\n********************\n'

	
getUser = (fbid) ->
	dbPath = '/facebook_users/uid/' + fbid + '.json'
	client = new httpClient.httpclient
	client.perform config.sql.fullHost + dbPath, "GET", (res) -> 
		if res.response.status is 500
			result = 'error'
		else 
			result = res.response.body
		console.log '\n********************\n\ngetUser Result: \n\n' + result + '\n\n********************\n'
		return result
	
formatUser = (inbound) ->
	console.log  '\n********************\n\nBefore formatUser: \n\n' + inbound  + '\n\n********************\n'
	outbound = '{"facebook_user": { '
	Hash(inbound).forEach (value, key) ->
		switch key
			when 'id'
				outbound += '"uid":' + '"' + value + '",'
			when 'hometown'
				outbound += '"hometown":{'
				Hash(value).forEach (v2, k2) ->
					if k2 is 'id'
						outbound += '"facebook_id":' + '"' + v2 + '",'
					else
						outbound += '"' + k2 + '":' + '"' + v2 + '"'
				outbound += "},"
			when 'location'
				outbound += '"location":{' 
				Hash(value).forEach (v2, k2) ->
					if k2 is 'id'
						outbound += '"facebook_id":' + '"' + v2 + '",'
					else
						outbound += '"' + k2 + '":' + '"' + v2 + '"'	
				outbound += "},"	
			when 'name'	
				outbound += '"' + key + '":' + '"' + value + '",'
			when 'first_name'	
				outbound += '"' + key + '":' + '"' + value + '",'
			when 'last_name'	
				outbound += '"' + key + '":' + '"' + value + '",'
			when 'link'	
				outbound += '"' + key + '":' + '"' + value + '",'
			when 'username'	
				outbound += '"' + key + '":' + '"' + value + '",'
			when 'birthday'	
				outbound += '"' + key + '":' + '"' + value + '",'
			when 'email'	
				outbound += '"' + key + '":' + '"' + value + '",'
			when 'timezone'	
				outbound += '"' + key + '":' + '"' + value + '",'
			when 'locale'	
				outbound += '"' + key + '":' + '"' + value + '",'
			when 'verified'	
				outbound += '"' + key + '":' + '"' + value + '"'
			when 'gender'	
				outbound += '"' + key + '":' + '"' + value + '",'
			else
				console.log "Skipping: " + key + " : " + value
		console.log key, value
	
		outbound += '}}'
		console.log  '\n********************\n\nAfter formatUser: \n\n' + outbound  + '\n\n********************\n'
	
	return outbound
	
		
		
exports.addUser = addUser
exports.formatUser = formatUser
exports.store_user = storeUser
exports.userDeauthed = userDeauthed
exports.userDeclinedAccess = userDeclinedAccess
exports.authUser = authUser
exports.renderIndex = renderIndex