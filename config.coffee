############
##	Default settings for the Anatomy Pro-Am server
##	- Overwrite defaults if you want
###########

exports.version = 'v0.01'

# Main server
exports.server = {
	port: 8003
}

# Redis server
exports.redis = {
	server: '127.0.0.1',
	port: 6379
}

# Facebook settings
exports.fbconfig = {
	appId: '195426547154882'
	apiKey: '31140e3cf6361171d37ce76eaabfac78'
	appSecret: '4fc5dd2a7e9946b959504ab1f229b6bc'
}