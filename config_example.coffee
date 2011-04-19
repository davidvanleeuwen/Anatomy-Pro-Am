############
##	Default settings for the Anatomy Pro-Am server
##	- Overwrite defaults if you want
## 	- Call this file config.coffee
###########

exports.version = 'v0.01'

# Main server
exports.server = {
	port: 8001
}

# Redis server
exports.redis = {
	server: '127.0.0.1',
	port: 6379,
	db: 'apa-dev-name'
}

# Facebook settings
exports.fbconfig = {
	appId: '123',
	apiKey: '123',
	appSecret: '123',
	url: 'http://host/',
	redirect_uri: 'http://host/authresponse/',
	#scope: 'user_photos,email,user_birthday,user_online_presence,offline_access'
	scope: ''
}