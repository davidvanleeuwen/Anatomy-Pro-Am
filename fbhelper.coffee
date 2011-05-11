config = require './config'
fbgraph = require 'facebook-graph@0.0.6'
fbutil = require './facebookutil.js'
http = require 'http'
color = require('./color.js').set
httpClient = require './public/javascripts/httpclient.js'
Hash = require 'hashish@0.0.2'

storeUser = (userData, userCode) ->
	##Will store user to DB.  
	addUser userData, (cb) ->
	
	
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
	Hash(d.data).forEach (friend) ->
		addUserAsFriend myID, friend
	getUser myID, (getUserResult) -> 
		getFriends JSON.parse(getUserResult).facebook_user.id, (friendsResult) ->
			#console.log friendsResult
			
getFriends = (uid, cb) ->
	dbPath = '/users/' + uid + '/friends.json'
	client = new httpClient.httpclient
	client.perform config.sql.fullHost + dbPath, "GET", (res) ->
		result = res.response.body
		cb result
		
associateFriend = (uid, friendID) ->
	dbPath = '/users/' + uid + '/friends'
	postData = '{"friend_id":' + friendID + '}'
	client = new httpClient.httpclient
	client.perform config.sql.fullHost + dbPath, "POST", (res) ->
		result = res.response.body
		#console.log result
	,postData

addUser = (info, callback) ->
	getUser info.id, (cb) ->
		if cb.error is 404
			console.log color '------------------- USER DOES NOT EXIST - CREATING -------------------\n', 'green'
			console.log info.id + " " + info.name
			postData = formatUser info
			dbPath = '/facebook_users.json'
			client2 = new httpClient.httpclient
			client2.perform config.sql.fullHost + dbPath, "POST", (resp) -> 
				result = resp.response.body
				console.log color '------------------- RESULT OF ADDING USER -------------------\n', 'green'
				console.log JSON.parse(result).facebook_user.id, JSON.parse(result).facebook_user.name 
				callback result
			,postData
		else 
			result = color '------------------- USER ALREADY EXISTS -------------------\n', 'green'
			result += JSON.parse(cb).facebook_user.id + " - " + JSON.parse(cb).facebook_user.name
			#console.log result

addUserAsFriend = (playerID, friendInfo) ->
	myID = ''
	getUser playerID, (cb) ->
		myID = JSON.parse(cb).facebook_user.id
		addUser friendInfo, (cb) ->
			associateFriend myID, JSON.parse(cb).facebook_user.id
	
getUser = (fbid, cb) ->
	dbPath = '/facebook_users/uid/' + fbid + '.json'
	client = new httpClient.httpclient
	client.perform config.sql.fullHost + dbPath, "GET", (res) -> 
		if res.response.status is 404
			result = {error: 404}
		else 
			result = res.response.body		
		cb result
		#console.log '\n-------------------\n\ngetUser Result: \n\n' + result + '\n\n----------------\n'

	
formatUser = (inbound) ->
	outbound = {}
	#console.log  '\n-------------------\n\nBefore formatUser: \n\n' + inbound  + '\n\n----------------\n'
	Hash(inbound).forEach (value, key) ->
		switch key
			when 'id'
				outbound["uid"] = value
			when 'hometown'
				outbound['hometown'] = {}
				Hash(value).forEach (v2, k2) ->
					if k2 is 'id'
						outbound['hometown']["facebook_id"] =  v2 
					else
						outbound['hometown'][k2] = v2 
			when 'location'
				outbound['location'] = {} 
				Hash(value).forEach (v2, k2) ->
					if k2 is 'id'
						outbound['location']["facebook_id"] = v2 
					else
						outbound['location'][k2] = v2
			when 'name','first_name','last_name','link','username','birthday','email','timezone','locale','verified','gender'
				outbound[key] =  value
			else
				console.log "Skipping: " + key + " : " + value
	f = {}
	f['facebook_user'] = outbound
	outbound = JSON.stringify f
	#console.log  '\n-------------------\n\nAfter formatUser: \n\n' + outbound  + '\n\n----------------\n'
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