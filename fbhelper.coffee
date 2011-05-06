config = require './config'
fbgraph = require 'facebook-graph@0.0.6'
fbutil = require './facebookutil.js'
http = require 'http'
color = require('./color.js').set
httpClient = require './public/javascripts/httpclient.js'
Hash = require 'hashish@0.0.2'

storeUser = (userData, userCode) ->
	##Will store user to DB.  
	addUser (userData);
	
userDeauthed = (reqInfo, res) ->
	#do something with deauthed user info
	console.log(color "------------------- USER REMOVED APP! ----------------", 'red')
	console.log (JSON.parse(base64decode(reqInfo.body.signed_request.split('.')[1])).user_id)
	console.log(color "------------------- USER REMOVED APP! ----------------", 'red')
	res.redirect ('http://www.wisc.edu')
	
userDeclinedAccess = (reqInfo,res) ->
	#so something when a user declines using the app from the access window
	console.log color "------------------- USER DENIED TERMS ----------------", 'red'
	console.log(reqInfo.query.error_reason)
	console.log(reqInfo.query.error)
	console.log(reqInfo.query.error_description)
	console.log color "------------------- USER DENIED TERMS ----------------", 'red'
	res.redirect ('http://www.wisc.edu')

authresponse = (req, res) ->
	if req.query.code
		console.log color "------------------- USER ACCEPTED TERMS, REQUESTING ACCESS TOKEN ----------------", 'green'
		##compile access token requirements
		path = '/oauth/access_token'
		args = {
			client_id: config.fbconfig.appId
			redirect_uri: config.fbconfig.redirect_uri
			client_secret: config.fbconfig.appSecret
			code: req.query.code			
		}
		fbutil.auth path, 'GET', args, (error, token) ->
			if token
				graph = new fbgraph.GraphAPI token
				graph.getObject 'me', (error, userData) ->
					if error
						console.log color '------------------- UNABLE TO RETRIEVE USER OBJECT FROM FACEBOOK ----------------', 'red'
						console.log error
					if userData
							storeUser userData, token
		res.redirect config.fbconfig.url
	else
		console.log color '------------------- NO CODE RETURNED FROM SERVER! ----------------', 'red'
		console.log req
		res.end
	if req.query.error_reason	
		userDeclinedAccess(req, res)
		res.end()
		
###
renderIndex :
Renders gathers user info based on either a signed request or the users cookie, or ref's to auth page. 

###
renderIndex =  (req, res, getToken) ->
	user = fbgraph.getUserFromCookie(req.cookies, config.fbconfig.appId, config.fbconfig.appSecret)
	if req.body
		console.log color '------------------- USER AUTHED BY SIGNED_REQUEST -------------------', 'blue'
		user2 = JSON.parse base64decode(req.body.signed_request.split('.')[1])
		gatherInitLogin user2.oauth_token, user2.user_id, getToken, (callback) ->
			if callback.error
				res.render 'auth', {fb: config.fbconfig}
			else	
				res.render 'index', {fb: config.fbconfig, token: callback.data.token}
	else
		if user
			console.log color '------------------- USER AUTHED BY COOKIE -------------------', 'blue'
			gatherInitLogin user.access_token, user.uid, getToken, (callback) ->
				if callback.error
					res.render 'auth', {fb: config.fbconfig}
				else	
					res.render 'index', {fb: config.fbconfig, token: callback.data.token}
		else
			console.log color '------------------- NO USER - RENDERING AUTH PAGE -------------------', 'blue'
			res.render 'auth', {fb: config.fbconfig}
			
gatherInitLogin = (authToken, userID, getToken, cb) ->
	fbGetMeObject authToken, (callback) ->
		if callback.data
			token = getToken callback.data
			if token
				storeUser callback.data, authToken
				cb {data: {token: token}}
		if callback.error
			cb {error: callback.error}
	fbGetFriendsObject authToken, (callback) ->
		if callback.data
			addMyFriends callback.data, userID
	
fbGetFriendsObject = (authToken, callback) ->
	graph = new fbgraph.GraphAPI authToken
	graph.getConnections 'me','friends', (error, data) ->
		if error
			console.log color 'fbGetFriendsObject error: ', 'red'
			console.log error
			callback {error: error}
		else
			callback {data: data}
			
fbGetMeObject = (authToken, callback) ->
	graph = new fbgraph.GraphAPI authToken
	graph.getObject 'me', (error, data) ->
		if error
			console.log color 'fbGetMeObject error: ', 'red'
			console.log error
			callback {error: error}
		else
			callback {data: data}
			
addMyFriends = (d, myID) ->
	console.log d, myID
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
			console.log color '------------------- USER DOES NOT EXIST - CREATING -------------------\n', 'green'
			postData = formatUser info
			dbPath = '/facebook_users.json'
			client2 = new httpClient.httpclient
			client2.perform config.sql.fullHost + dbPath, "POST", (resp) -> 
				result = resp.response.body
				console.log color '------------------- RESULT OF ADDING USER -------------------\n', 'green'
				console.log result	
			,postData
		else 
			result = color '------------------- USER ALREADY EXISTS -------------------\n', 'green'
			result += JSON.parse(res.response.body).facebook_user.id + " - " + JSON.parse(res.response.body).facebook_user.first_name + " " + JSON.parse(res.response.body).facebook_user.last_name
		console.log result

	
getUser = (fbid) ->
	dbPath = '/facebook_users/uid/' + fbid + '.json'
	client = new httpClient.httpclient
	client.perform config.sql.fullHost + dbPath, "GET", (res) -> 
		if res.response.status is 500
			result = 'error'
		else 
			result = res.response.body
		console.log '\n-------------------\n\ngetUser Result: \n\n' + result + '\n\n----------------\n'
		return result
	
formatUser = (inbound) ->
	console.log  '\n-------------------\n\nBefore formatUser: \n\n' + inbound  + '\n\n----------------\n'
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
	console.log  '\n-------------------\n\nAfter formatUser: \n\n' + outbound  + '\n\n----------------\n'
	return outbound
	
cleanJSON = (input) ->
	keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=:-_{}[]".,|'
	output = ""
	k = 0
	o = ''
	while k < input.length
		a = input.charAt(k++)
		j = 0
		while j < keyStr.length
			if a is keyStr.charAt(j++)
				o += a
	return o
	
base64decode = (input) ->
	keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
	output = ""
	i = 0
	while i < input.length
		enc1 = keyStr.indexOf(input.charAt(i++))
		enc2 = keyStr.indexOf(input.charAt(i++))
		enc3 = keyStr.indexOf(input.charAt(i++))
		enc4 = keyStr.indexOf(input.charAt(i++))
		chr1 = (enc1 << 2) | (enc2 >> 4)
		chr2 = ((enc2 & 15) << 4 | (enc3 >> 2))
		chr3 = ((enc3 & 3) << 6 | enc4)
		
		output += String.fromCharCode chr1
		if enc3 != 64
			output += String.fromCharCode chr2
		if enc4 != 64
			output += String.fromCharCode chr3
	return cleanJSON unescape output
		
exports.addUser = addUser
exports.formatUser = formatUser
exports.store_user = storeUser
exports.userDeauthed = userDeauthed
exports.userDeclinedAccess = userDeclinedAccess
exports.authresponse = authresponse
exports.renderIndex = renderIndex