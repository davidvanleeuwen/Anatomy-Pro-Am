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

exports.sql = {
#	server: 'http://10.129.3.163',
	server: 'http://c.apa.dev.mirerca.com',
	port: '9006',
	fullHost: 'http://127.0.0.1:9006'
}

# Facebook settings
exports.fbconfig = {
	appId: '1234'
	apiKey: '1234'
	appSecret: '1234'
	redirect_uri: 'http://c.apa.dev.mirerca.com/authresponse/'
	url: 'http://apps.facebook.com/anatomy_pro-am/'
	signedup: 'http://c.apa.dev.mirerca.com/finishedsignin/'
	#scope: 'user_photos,email,user_birthday,user_online_presence,offline_access'
	scope: ''
}