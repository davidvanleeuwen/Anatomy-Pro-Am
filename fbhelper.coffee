config = require './config'
fbgraph = require 'facebook-graph@0.0.6'
fbutil = require './facebookutil.js'
http = require 'http'
https = require 'https'
color = require('./color.js').set
httpClient = require './public/javascripts/httpclient.js'
client = new httpClient.httpclient
Hash = require 'hashish@0.0.2'
rfc3339 = require './rfc3339.js'

storeUser = (userData, userCode) ->
	##Will store user to DB.  
	console.log 'store user'
	addUser userData, (callback) ->
		getUser userData.id, (cb) ->
			if not cb.error
				addOauthCredental cb.info.facebook_user.id, userCode, (callback) ->
					console.log 'get user response back from adding oauth'
					#console.log callback
			else
				console.log "this is coming from storeUser.getUser"
				#console.log cb

addOauthCredental = (userID, userCode, callback) ->
	#/users/:user_id/facebook_user/authorizations(.:format)  
	console.log 'this is the oauth area'
	console.log userID + " " + userCode  
	dbPath = '/users/' + userID + '/facebook_user/authorizations.json' 
	postData = {}
	postData["id"] = config.fbconfig.internalAppID
	postData["user_id"] = userID
	postData["auth_code"] = userCode
	postData = JSON.stringify postData
	#client = new httpClient.httpclient
	client.perform config.sql.fullHost + dbPath, "POST", (res) ->
		callback res.response.body
	,postData

userDeauthed = (reqInfo, res) ->
	#do something with deauthed user info
	console.log(color "------------------- USER REMOVED APP! ----------------", 'red')
	#removed the following line as it started erroring - if we decide to use it i'll fix it
	#console.log (JSON.parse(base64decode(reqInfo.body.signed_request.split('.')[1])).user_id)
	#console.log(color "------------------- USER REMOVED APP! ----------------", 'red')
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
	fbGetMeObject authToken, (callback) -> #get "ME" object from facebook (name, id, bday, etc)
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
	updateAllOnlineStatus myID, d.data
	Hash(d.data).forEach (friend) ->
		addUserAsFriend myID, friend
	getUser myID, (getUserResult) ->
		if not getUserResult.error
			getFriends getUserResult.info.facebook_user.id, (friendsResult) ->
				#console.log friendsResult
		else
		 	console.log "This is from addMyFriends.getUser"
			console.log getUserResult
			
getMyAuthCode = (uid, authResponse) ->
	getUser uid, (cb) ->
		if cb.error == 0 or 100
			userApps = cb.info.facebook_user.application_authorizations
			Hash(userApps).forEach (value, key) ->
				if value.application.app_id == config.fbconfig.appId
					authResponse value.auth_code
					
updateAllOnlineStatus = (UID, friends) ->
	accessToken = ''
	getUser UID, (cb) ->
		if cb.error == 0 or 100
			userApps = cb.info.facebook_user.application_authorizations
			formattedFriends = ''
			Hash(friends).forEach (friend) ->
				formattedFriends += "uid=" + friend.id + " OR "
			formattedFriends = formattedFriends.substring 0, formattedFriends.length - 3
			Hash(userApps).forEach (value, key) ->
				if value.application.app_id == config.fbconfig.appId
					outObject = {}
					outObject['facebook_user'] = {}
					accessToken = value.auth_code
					url = 'api.facebook.com'
					path1 = '/method/fql.query?'
					path2 = 'access_token=' + accessToken + '&format=JSON&query=SELECT online_presence FROM user WHERE ' + formattedFriends
					path = path1 + encodeURI path2
					outdata = ''
					https.get {host: url, path: path}, (res)->
						myBody = []
						res.setEncoding('utf8')
						if res.headers['content-encoding'] == 'gzip'
							res.setEncoding("binary")
						res.on 'data', (chunk) ->
							myBody.push chunk
						res.on 'end', () ->
							body = myBody.join ("")
							if res.headers["content-encoding"] == "gzip"
								gunzip.init
								body = gunzip.inflate body, 'binary'
								gzip.end
							index = 0
							Hash(JSON.parse(body)).forEach (value) ->
								friend = friends[index]
								index++
								if value.online_presence == 'active'
									date = new Date()
									date = date.toRFC3339UTCString()
									outObject['facebook_user']['last_online'] = date
									console.log color friend.name + " is online", 'blue'
									setOnlineStatus outObject, friend
						res.on 'error', (e) ->
							console.log 'Error: ' + e
							
setOnlineStatus = (dateTime, friend) ->
	getUser friend.id, (cb) ->
		dbPath = '/users/' + cb.info.facebook_user.id + '/facebook_user.json'
		client.perform config.sql.fullHost + dbPath, "PUT", (res) ->
			if res.response.body != undefined
				a = 1 # this just satisfies the statement - 
				#console.log JSON.parse res.response.body
		,JSON.stringify dateTime	
		
getFriends = (uid, cb) ->
	getUser uid, (back) ->
		if back.error == 0
			dbPath = '/users/' + back.info.facebook_user.id + '/friends.json'
			client.perform config.sql.fullHost + dbPath, "GET", (res) ->
				result = JSON.parse(res.response.body)
				cb result

exports.getOnlineFriends = (uid, cb) ->
	getFriends uid, (callback) ->
		toReturn = {}
		date = new Date()
		date = date.toRFC3339UTCString()
		Hash(callback.users).forEach (value) ->
			if value.facebook_user != null && value.facebook_user != undefined
				if value.facebook_user.last_online != undefined && value.facebook_user.last_online != null
					console.log Date.parse(date).getTime() - Date.parse(value.facebook_user.last_online).getTime() 
					if Date.parse(date).getTime() - Date.parse(value.facebook_user.last_online).getTime()  < 300000 #5 minute timeout @ 300,000 ms
						toReturn[value.id] = value.facebook_user
		console.log JSON.stringify toReturn
		cb toReturn

exports.appRequest = (myid, yourid) ->
	console.log myid, yourid
	inviter = {}
	invitee = {}
	method = 'apprequests'
	title = 'We need your help!'
	message = ""
	getUser myid, (myInfo) ->
		console.log myInfo
		getUser yourid, (yourInfo) ->
			console.log yourInfo
			getMyAuthCode myid, (cb) ->
				if cb.error == null || cb.error == undefined
					console.log cb
					message = myInfo.info.facebook_user.first_name + " needs your help to save a patients life!  "
					sentData = {message: message, title: title}
					console.log sentData
					graph = new fbgraph.GraphAPI cb
					graph.putObject yourid, method, sentData , (error, data) ->
						if error
							console.log color 'sendAppRequest error: ', 'red'
							console.log {error: error}
						else
							console.log color 'sendAppRequest Successful: ', 'green'
							console.log {data: data}
			

associateFriend = (uid, friendID) ->
	dbPath = '/users/' + uid + '/friends'
	postData = '{"friend_id":' + friendID + '}'
	#client = new httpClient.httpclient
	client.perform config.sql.fullHost + dbPath, "POST", (res) ->
		result = res.response.body
		#console.log result
	,postData

addUser = (info, callback) ->
	getUser info.id, (cb) ->
		if cb.error is 100 and info.first_name is not null
			#this is set when the user exists, but they have invalid info.  This will then overwrite the user.  console.log 'get user response with error'
			console.log color '------------------- USER EXISTS AS FRIEND ADDITION - RECREATING -------------------\n', 'green'
			console.log info.id + " " + info.name
			postData = formatUser info
			dbPath = '/facebook_users.json'
			#client2 = new httpClient.httpclient
			client.perform config.sql.fullHost + dbPath, "PUT", (resp) -> 
				result = {}
				result = {error: 0, info: JSON.parse(resp.response.body)}
				console.log color '------------------- RESULT OF ADDING USER -------------------\n', 'green'
				console.log resp
				#console.log JSON.parse(result).facebook_user.id, JSON.parse(result).facebook_user.name 
				#callback result
			,postData
		if cb.error is 404
			console.log 'get user response with error'
			console.log color '------------------- USER DOES NOT EXIST - CREATING -------------------\n', 'green'
			console.log info.id + " " + info.name
			postData = formatUser info
			dbPath = '/facebook_users.json'
			#client2 = new httpClient.httpclient
			client.perform config.sql.fullHost + dbPath, "POST", (resp) -> 
				result = {}
				result = {error: 0, info: JSON.parse(resp.response.body)}
				console.log color '------------------- RESULT OF ADDING USER -------------------\n', 'green'
				console.log result.info.facebook_user.id, result.info.facebook_user.name 
				callback result
			,postData
		if not cb.error 
			result = color '------------------- USER ALREADY EXISTS -------------------\n', 'green'
			result += cb.info.facebook_user.id + " - " + cb.info.facebook_user.name
			callback cb
			#console.log result

addUserAsFriend = (playerID, friendInfo) ->
	myID = ''
	getUser playerID, (cb) ->
		myID = cb.info.facebook_user.id
		addUser friendInfo, (cb) ->
			console.log cb
			if cb.info != undefined
				associateFriend myID, cb.info.facebook_user.id

getUser = (fbid, cb) ->
	dbPath = '/facebook_users/uid/' + fbid + '.json'
	#client = new httpClient.httpclient
	client.perform config.sql.fullHost + dbPath, "GET", (res) -> 
		if res.response.status is 404
			result = {error: 404, info: null}
		else 
			if JSON.parse(res.response.body).facebook_user.first_name is null
				result = {error: 100, info: JSON.parse(res.response.body)}
			else
				result = {error: 0, info: JSON.parse(res.response.body)}
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