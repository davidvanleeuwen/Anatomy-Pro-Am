############
##	Default settings for the Anatomy Pro-Am server
##	- Overwrite defaults if you want
###########

exports.version = 'v0.01'

# Main server
exports.server = {
	port: 8001
}

# Redis server
exports.redis = {
	server: '127.0.0.1',
	port: 6379
}

# Facebook settings
exports.fbconfig = {
	appId: '140523449349143'
	apiKey: 'ce1eb8dfeb1426ed26f3088c1342c8e33'
	appSecret: 'eb5d3c2272b6a691cf205af78fb9db98'
}