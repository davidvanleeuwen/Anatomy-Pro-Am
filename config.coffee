############
##	Default settings for the Anatomy Pro-Am server
##	- Overwrite defaults if you want
###########

# Main (socket) server
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
	secret: '',
	key: ''
}