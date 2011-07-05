
console.log("here to here");
		//arrayify data
		//console.log(points);
		//console.log(currentLayerGoalPoints);
		var goalPointsXY = currentLayerGoalPoints;
		var mainPointArr = new Array(width*height);
		for(var y = 0; y < height; y++)
			for(var x = 0; x < width; x++){
				mainPointArr[y*width+x] = true;
			}
		for(key in layerPointData){
			mainPointArr[layerPointData[key].point.x+(layerPointData[key].point.y*width)] = false;
		}		
		
		console.log("here to here");
		//blobify data
		var pixelStack = [[0, 0]];
		while(pixelStack.length)
		{
			var newPos, x, y, pixelPos, reachLeft, reachRight;
			newPos = pixelStack.pop();
			x = newPos[0];
			y = newPos[1];

			pixelPos = (y*width + x);
			while(y-- >= 0 && mainPointArr[pixelPos]){
				pixelPos -= width * 4;
			}
			pixelPos += width * 4;
			++y;
			reachLeft = false;
			reachRight = false;
			while(y++ < height-1 && mainPointArr[pixelPos])
			{
				mainPointArr[pixelPos]=false;
				if(x > 0)
				{
					if(mainPointArr[(pixelPos - 1)])
					{
						if(!reachLeft){
							pixelStack.push([x - 1, y]);
							reachLeft = true;
						}
					}
					else if(reachLeft)
					{
						reachLeft = false;
					}
				}

				if(x < width-1)
				{
					if(mainPointArr[(pixelPos + 1)])
					{
						if(!reachRight)
						{
							pixelStack.push([x + 1, y]);
							reachRight = true;
						}
					}
					else if(reachRight)
					{
						reachRight = false;
					}
				}
			pixelPos += width;
			}
		}
		//compare against goalData
		var healthyHit = 0;
		var healthyMissed = 0;
		var offsetLeft = 0;
		var goalArrX = new Array();
		var goalArrY = new Array();
		var healthyArrX = new Array();
		var healthyArrY = new Array();		
		for(var c = 0; c<(goalPointsXY.length/2); c++){
			goalArrX[c]=goalPointsXY[c*2+0] + offsetLeft;
			goalArrY[c]=goalPointsXY[c*2+1];
		}
		for(var c = 0; c < goalArrX.length; c++){
			if((mainPointArr[((goalArrY[c]*(width)) + (goalArrX[c]))]))
				score[0]++;
				else
				score[1]++;
			}
/*
	for(var c = 0; c < healthyArrX.length; c++){
		if((newImageData.data[((healthyArrY[c]*(newImageData.width*4)) + (healthyArrX[c]*4)) + 3]) >= 100)
			healthyHit++;
		else
			healthyMissed++;
	}
*/



