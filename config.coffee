############
##	Default settings for the Anatomy Pro-Am server
##	- Overwrite defaults if you want
###########

exports.version = 'v0.01'

# Main server
exports.server = {
	port: 3000
}

# Redis server
exports.redis = {
	server: '127.0.0.1',
	port: 6379
}

# Facebook settings
exports.facebook = {
	appId: '195426547154882',
	secret: '4fc5dd2a7e9946b959504ab1f229b6bc'
}