_ = require('underscore@1.1.5')._
redis = require 'redis@0.6.0'


###
#	Score Manager
###
exports.setGoalPointsForCaseAndLayer = (self, case_ID, layer_ID, goalPoints) ->
	addGoalPointstoLayer = (layerIndex) ->
		self.redisClient.set 'Case:'+case_ID+':layer:'+layerIndex+':GoalPoints', JSON.stringify(goalPoints), (err, added) ->
			if err then console.log 'SET error: ', err
	self.redisClient.exists 'Case:'+case_ID+':layerCount', (err, doesExist) ->
		if doesExist == 0
			self.redisClient.set 'Case:'+case_ID+':layerCount', 1, (err, added) ->
				if err then console.log 'SET error: ', err
				console.log 1
				addGoalPointstoLayer layer_ID
		else
			self.redisClient.incr 'Case:'+case_ID+':layerCount', (err, newLayerCount) ->
				if err then console.log 'INCR error: ', err
				console.log newLayerCount
				addGoalPointstoLayer layer_ID

#Gets the goalPoints which is object {targetPoints, healthyPoints}
exports.getGoalPointsForCase = (self, case_ID, layer_ID, callback) ->
	self.redisClient.get 'Case:'+case_ID+':layer:'+layer_ID+':GoalPoints', (err, goalPoints) ->
		if err then console.log 'GET error: ', err
		goalPoints = JSON.parse goalPoints
		callback goalPoints

# Takes width*height sized Array with only 0's and 1's and floods the exterior region
# With value 2, leaving all regions encircled by 1's as 0's
# After function to check if region is circled all is needed is to check that it's value != 2
floodToolNonselectedRegion = (myPointArray, width, height) ->
	pixelStack = [[0, 0]];
	while pixelStack.length > 0
		newPos = pixelStack.pop()
		x = newPos[0]
		y = newPos[1]
		pixelPos = (y*width + x)
		while (y-=1) >= 0 and myPointArray[pixelPos] is 0
			pixelPos -= width
		pixelPos += width
		y += 1
		reachLeft = false
		reachRight = false
		while (y+=1) < height-1 and myPointArray[pixelPos] is 0
			myPointArray[pixelPos] = 2
			if x > 0
				if myPointArray[(pixelPos - 1)] is 0
					unless reachLeft
						pixelStack.push [x - 1, y]
						reachLeft = true
				else if reachLeft
					reachLeft = false
			if x < (width-1)
				if myPointArray[(pixelPos + 1)] is 0
					unless reachRight
						pixelStack.push [x + 1, y]
						reachRight = true
				else if reachRight
					reachRight = false
			pixelPos += width
	myPointArray

exports.getScoreForCaseAndLayer = (self, player_id, width, height, case_ID, layer_ID, myPoints, goalPoints, callback) ->
	self.score = {'tumorHit': 0, 'healthyHit': 0}
	#X = Even values (2n+0) Y = Odd values (2n+1)
	targetPointsXY = goalPoints['targetPoints'] 
	healthyPointsXY = goalPoints['healthyPoints']
	#Load all of myPoints into a width*height array so flood tool function of blobify can be used
	myPointArray = _.map [0...(width*height)], (num) ->
		return 0	
	_.each myPoints, (point) ->
		myPointArray[point.point.x+point.point.y*width] = 1
	#Flood tool time
	myPointArray = floodToolNonselectedRegion myPointArray, width, height 
	#Compare Against goalData (0's are selected regions, 1's are border regions, 2's are nonselected regions) 
	targetHit = 0
	healthyHit = 0
	_.each( _.range(targetPointsXY.length/2), (n) -> 
		if myPointArray[ ( ( targetPointsXY[ 2*n + 1] * (width) ) + ( targetPointsXY[2*n] ) ) ] isnt 2 
			targetHit += 1
	)	
	_.each( _.range(healthyPointsXY.length/2), (n) -> 
		if myPointArray[ ( ( healthyPointsXY[ 2*n + 1] * (width) ) + ( healthyPointsXY[2*n] ) ) ] isnt 2 
			healthyHit += 1
	)
	if targetPointsXY.length > 0
		self.score.tumorHit += targetHit * 200 / targetPointsXY.length
	if healthyPointsXY.length > 0
		self.score.healthyHit += healthyHit * 200 / healthyPointsXY.length
	console.log self.score
	callback self.score