	
		var TEngine = Class.create({
			callback: null,
			eventHandler: null,
			gameState: {
				height: 0,
				keys: {},
				mouse: {},
				metaKey: false
			},
			constructor: function(oViewPort, fCallback) {
				var oThis = this;
				this.viewPort = oViewPort;
				this.callback = fCallback;
				this.eventHandler = function(oEvent) {
					// update metakey state
					oThis.gameState.metaKey = oEvent.metaKey;
					if (oEvent.type == 'keydown') oThis.gameState.keys[oEvent.keyCode] = true;
					else if (oEvent.type == 'keyup') oThis.gameState.keys[oEvent.keyCode] = false;
					else if (oEvent.type == 'mousedown') oThis.gameState.mouse.down = true;
					else if (oEvent.type == 'mouseup') oThis.gameState.mouse.down = false;
					else if (oEvent.type == 'mousemove') {
						oThis.gameState.mouse.x = (oEvent.clientX - oThis.viewPort.offsetLeft);
						oThis.gameState.mouse.y = (oEvent.clientY - oThis.viewPort.offsetTop);
					}
				};
				this.currentIndex1=22;
				this.currentIndex0=10;
				
				
				
			},
			start: function(oViewPort) {
				var oThis = this;
				document.addEventListener('keydown', this.eventHandler, false);
				document.addEventListener('keyup', this.eventHandler, false);
				this.viewPort.addEventListener('mousemove', this.eventHandler, false);
				this.viewPort.addEventListener('mousedown', this.eventHandler, false);
				this.viewPort.addEventListener('mouseup', this.eventHandler, false);
				window.top.testInterval = function() {
					oThis.callback.call(oThis, oThis.gameState);
				}
				for (var c = 0; c < 1; c++) {
					setInterval(window.top.testInterval, 0);
				}
				
			}
		});
		
	</script>
	
	<script type="text/javascript">
		function start() {
			oEditor = new TEditor();
			var gameMatrix = new Array(
				new Array(3,3,3,3,3,3,3,3,3,3,3,3,3),
				new Array(1,0,0,0,0,0,0,0,0,0,0,0,1),
				new Array(1,0,0,0,0,0,0,0,0,0,0,0,1),
				new Array(1,0,0,0,0,0,0,0,0,0,0,0,1),
				new Array(1,0,0,0,0,0,0,0,0,0,0,0,1),
				new Array(1,0,0,0,0,0,0,0,0,0,0,0,1),
				new Array(1,0,0,0,0,0,0,0,0,0,0,0,1),
				new Array(1,0,0,0,0,0,0,0,0,0,0,0,1),
				new Array(1,0,0,0,0,0,0,0,0,0,0,0,1),
				new Array(1,0,0,0,0,0,0,0,2,0,0,0,1),
				new Array(1,0,0,0,0,0,0,0,0,0,0,0,1),
				new Array(1,0,0,0,0,0,0,0,0,0,0,0,1),
				new Array(1,1,1,1,1,1,1,1,1,1,1,1,1)
				
				);
			var realX = 8;
			var realY = 8;
			
			oEditor.loadLibrary('library/library.xml', function() {
				
				this.renderPalette(document.querySelector('.leftColumn'));
				this.renderWorkspace(document.querySelector('.viewPort'));
				if (window.XMLHttpRequest)
				  {// code for IE7+, Firefox, Chrome, Opera, Safari
				  xmlhttp=new XMLHttpRequest();
				  }
				else
				  {// code for IE6, IE5
				  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
				  }
				xmlhttp.open("GET","mapDN2.xml",false);
				xmlhttp.send();
				xmlDoc=xmlhttp.responseXML;

				console.log("and this now ");
				console.log(xmlDoc);
				console.log("but finally this");
				console.log(XMLtoString(xmlDoc));
				this.loadMapData(XMLtoString(xmlDoc));
				
				
				
				var iHeight = 0;
				var iScrollX = iNewScrollX = 0;
				var iScrollY = iNewScrollY = 0;
				var iCaptureX = iCaptureY = -1;
				
				window.addEventListener('resize', function() {
					oEditor.map.initViewPort(oEditor.map.viewPort.offsetWidth, oEditor.map.viewPort.offsetHeight);
					oEditor.renderMap(iScrollX, iScrollY);
				}, false);
					
				var iSecond = (new Date()).getSeconds();
				var iDate = (new Date());
				var iCounter = 0;
				var oFPSWindow = document.querySelector('.fpsWindow');
					
				(new TEngine(oEditor.map.viewPort.parentNode, function(oGameState) {
					
					var iNewSecond = (new Date()).getSeconds();
					iCounter++;
					
					var aCursorPos = oEditor.map.screen2map(
						oGameState.mouse.x,
						oGameState.mouse.y,
						iScrollX,
						iScrollY
					);
					
					
					/*
					var aTilePos = oEditor.map.map2screen(
						aCursorPos[0],
						aCursorPos[1]
					);
					
					oEditor.cursor.setStyle({
						'left': (aTilePos[0] + 'px'),
						'top': (aTilePos[1] + 'px')
					});
					*/
					
					
					
					if (oGameState.mouse.down) {
						if ((oGameState.metaKey) && (iCaptureX == -1) && (iCaptureY == -1)) {
							iCaptureX = oGameState.mouse.x + iScrollX;
							iCaptureY = oGameState.mouse.y + iScrollY;
						} else if (oGameState.metaKey) {
							iNewScrollX = (iCaptureX - oGameState.mouse.x);
							iNewScrollY = (iCaptureY - oGameState.mouse.y);
							if ((iNewScrollX != iScrollX) || (iNewScrollY != iScrollY)) {
								oEditor.renderMap(iNewScrollX, iNewScrollY);
								iScrollX = iNewScrollX;
								iScrollY = iNewScrollY;
							}
						} else if (oEditor.selectedObject) {

						

						

						
						console.log(oEditor.selectedObject);
							
						}
						
							
					   //
						
						
						if((aCursorPos[0] != this.currentIndex0 || aCursorPos[1] != this.currentIndex1) && (aCursorPos[0]!=0 &&aCursorPos[1]!=0)){
						
						
						
						
						
						var dif0 = Math.abs(aCursorPos[0]-this.currentIndex0);
						var dif1 = Math.abs(aCursorPos[1]-this.currentIndex1);
						
						console.log("move from: "+this.currentIndex0+" "+this.currentIndex1);
						console.log("move to: "+aCursorPos[0]+" "+aCursorPos[1]);
						
						
						var iNewDate = (new Date());
						
						
						if((dif0+dif1)>0 && ((iNewDate - iDate) > 200)){  
							iDate = iNewDate;
							//Move to a different spot
							//Replace old with good grass
							var sIndex = (this.currentIndex1) + '.' + (this.currentIndex0);
							var sBrush = "mmm2";
							this.activeObject = oEditor.selectedObject;
							oEditor.selectedObject = oEditor.objects["Tiles"]["mmm2"];
							//If it doesn't exist make it
							if (!oEditor.map.tiles[sBrush]) {
								oEditor.map.tiles[sBrush] = oEditor.map.createTile(
									oEditor.selectedObject.src,
									oEditor.selectedObject.width,
									oEditor.selectedObject.height
								);
							}
							//Remove old
							oEditor.map.objects[sIndex] = (oEditor.selectedObject.name);
							if (oEditor.map.mapData[sIndex]) {
								oEditor.map.mapData[sIndex].parentNode.removeChild(oEditor.map.mapData[sIndex]);
								delete(oEditor.map.mapData[sIndex]);
							}
							oEditor.renderMap(iScrollX, iScrollY);
						
							//THEN
							oEditor.selectedObject = this.activeObject;			
							
							//Move to a better spot
							var temp1=this.currentIndex1;
							var temp0=this.currentIndex0;
							//Try UP
							temp1--;
							if(temp1%2==0)temp0++;
							if(gameMatrix[realY+1][realX]!=1)var upDif=Math.abs(aCursorPos[0]-temp0)+Math.abs(aCursorPos[1]-temp1);
							else var upDif = 1000;
							temp1=this.currentIndex1;
							temp0=this.currentIndex0;
							//Try DOWN
							temp1++;
							if(temp1%2==1)temp0--;
							if(gameMatrix[realY-1][realX]!=1)var downDif=Math.abs(aCursorPos[0]-temp0)+Math.abs(aCursorPos[1]-temp1);
							else var downDif = 1000;
							temp1=this.currentIndex1;
							temp0=this.currentIndex0;
							//Try LEFT
							temp1--;
							if(temp1%2==1)temp0--;
							if(gameMatrix[realY][realX-1]!=1)var leftDif=Math.abs(aCursorPos[0]-temp0)+Math.abs(aCursorPos[1]-temp1);
							else var leftDif=1000;
							temp1=this.currentIndex1;
							temp0=this.currentIndex0;
							//Try RIGHT
							temp1++;
							if(temp1%2==0)temp0++;
							if(gameMatrix[realY][realX+1]!=1)var rightDif=Math.abs(aCursorPos[0]-temp0)+Math.abs(aCursorPos[1]-temp1);
							else var rightDif =1000;
							
							
							
							if(upDif<downDif&&upDif<leftDif&&upDif<rightDif){
								//Shift active piece UP
								if(gameMatrix[realY+1][realX]==0){
									this.currentIndex1--;
									if(this.currentIndex1%2==0)this.currentIndex0++;
									realY++;
								}else{
									gameEvent(gameMatrix[realY+1][realX]);
									oGameState.mouse.down = false;
								}
							}else if(downDif<leftDif&&downDif<rightDif){		
								//Shift active piece DOWN
								if(gameMatrix[realY-1][realX]==0){
									this.currentIndex1++;
									if(this.currentIndex1%2==1)this.currentIndex0--;
									realY--;
								}else{
									gameEvent(gameMatrix[realY-1][realX]);
									oGameState.mouse.down = false;
								}
							}else if(leftDif<rightDif){
								//Shift active piece LEFT
								if(gameMatrix[realY][realX-1]==0){
									this.currentIndex1--;
									if(this.currentIndex1%2==1)this.currentIndex0--;				
									realX--;					
								}else{
									gameEvent(gameMatrix[realY][realX-1]);
									oGameState.mouse.down = false;
								}	
							}else{
								//Shift active piece RIGHT
								if(gameMatrix[realY][realX+1]==0){
									this.currentIndex1++;
									if(this.currentIndex1%2==0)this.currentIndex0++;
									realX++;
								}else{
									gameEvent(gameMatrix[realY][realX+1]);
									oGameState.mouse.down = false;
								}
							}
							
							sIndex = (this.currentIndex1) + '.' + (this.currentIndex0);
							sBrush = this.currentBrush;
							//If it doesn't exist make it
							if (!oEditor.map.tiles[sBrush]) {
								oEditor.map.tiles[sBrush] = oEditor.map.createTile(
									oEditor.selectedObject.src,
									oEditor.selectedObject.width,
									oEditor.selectedObject.height
								);
							}
							this.currentBrush = sBrush;
							//Remove old
							oEditor.map.objects[sIndex] = (oEditor.selectedObject.name);
							if (oEditor.map.mapData[sIndex]) {
								oEditor.map.mapData[sIndex].parentNode.removeChild(oEditor.map.mapData[sIndex]);
								delete(oEditor.map.mapData[sIndex]);
							}
							oEditor.renderMap(iScrollX, iScrollY);
							//console.info(oEditor.map.tiles);
							
							
							dif0 = Math.abs(aCursorPos[0]-this.currentIndex0);
							dif1 = Math.abs(aCursorPos[1]-this.currentIndex1);
						
						}
						
					}
							
						
					} else if ( oGameState.keys[38] ){ //UP
						//Replace old with good grass
						var sIndex = (this.currentIndex1) + '.' + (this.currentIndex0);
						var sBrush = "mmm2";
						this.activeObject = oEditor.selectedObject;
						oEditor.selectedObject = oEditor.objects["Tiles"]["mmm2"];
						//If it doesn't exist make it
						if (!oEditor.map.tiles[sBrush]) {
							oEditor.map.tiles[sBrush] = oEditor.map.createTile(
								oEditor.selectedObject.src,
								oEditor.selectedObject.width,
								oEditor.selectedObject.height
							);
						}
						//Remove old
						oEditor.map.objects[sIndex] = (oEditor.selectedObject.name);
						if (oEditor.map.mapData[sIndex]) {
							oEditor.map.mapData[sIndex].parentNode.removeChild(oEditor.map.mapData[sIndex]);
							delete(oEditor.map.mapData[sIndex]);
						}
						oEditor.renderMap(iScrollX, iScrollY);
						
						//THEN
						oEditor.selectedObject = this.activeObject;					
						//Shift active piece UP
						this.currentIndex1--;
						if(this.currentIndex1%2==0)this.currentIndex0++;
						
						sIndex = (this.currentIndex1) + '.' + (this.currentIndex0);
						sBrush = this.currentBrush;
						//If it doesn't exist make it
						if (!oEditor.map.tiles[sBrush]) {
							oEditor.map.tiles[sBrush] = oEditor.map.createTile(
								oEditor.selectedObject.src,
								oEditor.selectedObject.width,
								oEditor.selectedObject.height
							);
						}
						this.currentBrush = sBrush;
						//Remove old
						oEditor.map.objects[sIndex] = (oEditor.selectedObject.name);
						if (oEditor.map.mapData[sIndex]) {
							oEditor.map.mapData[sIndex].parentNode.removeChild(oEditor.map.mapData[sIndex]);
							delete(oEditor.map.mapData[sIndex]);
						}
						oEditor.renderMap(iScrollX, iScrollY);
						//console.info(oEditor.map.tiles);
						oGameState.keys[38] = false;
					} else if ( oGameState.keys[40] ){ //DOWN
						//Replace old with good grass
						var sIndex = (this.currentIndex1) + '.' + (this.currentIndex0);
						var sBrush = "mmm2";
						this.activeObject = oEditor.selectedObject;
						oEditor.selectedObject = oEditor.objects["Tiles"]["mmm2"];
						//If it doesn't exist make it
						if (!oEditor.map.tiles[sBrush]) {
							oEditor.map.tiles[sBrush] = oEditor.map.createTile(
								oEditor.selectedObject.src,
								oEditor.selectedObject.width,
								oEditor.selectedObject.height
							);
						}
						//Remove old
						oEditor.map.objects[sIndex] = (oEditor.selectedObject.name);
						if (oEditor.map.mapData[sIndex]) {
							oEditor.map.mapData[sIndex].parentNode.removeChild(oEditor.map.mapData[sIndex]);
							delete(oEditor.map.mapData[sIndex]);
						}
						oEditor.renderMap(iScrollX, iScrollY);
						
						//THEN
						oEditor.selectedObject = this.activeObject;
						//Shift active piece DOWN
						this.currentIndex1++;
						if(this.currentIndex1%2==1)this.currentIndex0--;
						var sIndex = (this.currentIndex1) + '.' + (this.currentIndex0);
						var sBrush = this.currentBrush;
						//If it doesn't exist make it
						if (!oEditor.map.tiles[sBrush]) {
							oEditor.map.tiles[sBrush] = oEditor.map.createTile(
								oEditor.selectedObject.src,
								oEditor.selectedObject.width,
								oEditor.selectedObject.height
							);
						}
						this.currentBrush = sBrush;
						//Remove old
						oEditor.map.objects[sIndex] = (oEditor.selectedObject.name);
						if (oEditor.map.mapData[sIndex]) {
							oEditor.map.mapData[sIndex].parentNode.removeChild(oEditor.map.mapData[sIndex]);
							delete(oEditor.map.mapData[sIndex]);
						}
						oEditor.renderMap(iScrollX, iScrollY);
						oGameState.keys[40] = false;
					} else if ( oGameState.keys[37] ){ //LEFT
						//Replace old with good grass
						var sIndex = (this.currentIndex1) + '.' + (this.currentIndex0);
						var sBrush = "mmm2";
						this.activeObject = oEditor.selectedObject;
						oEditor.selectedObject = oEditor.objects["Tiles"]["mmm2"];
						//If it doesn't exist make it
						if (!oEditor.map.tiles[sBrush]) {
							oEditor.map.tiles[sBrush] = oEditor.map.createTile(
								oEditor.selectedObject.src,
								oEditor.selectedObject.width,
								oEditor.selectedObject.height
							);
						}
						//Remove old
						oEditor.map.objects[sIndex] = (oEditor.selectedObject.name);
						if (oEditor.map.mapData[sIndex]) {
							oEditor.map.mapData[sIndex].parentNode.removeChild(oEditor.map.mapData[sIndex]);
							delete(oEditor.map.mapData[sIndex]);
						}
						oEditor.renderMap(iScrollX, iScrollY);
						
						//THEN
						oEditor.selectedObject = this.activeObject;
						//Shift active piece LEFT
						this.currentIndex1--;
						if(this.currentIndex1%2==1)this.currentIndex0--;
						var sIndex = (this.currentIndex1) + '.' + (this.currentIndex0);
						var sBrush = this.currentBrush;
						//If it doesn't exist make it
						if (!oEditor.map.tiles[sBrush]) {
							oEditor.map.tiles[sBrush] = oEditor.map.createTile(
								oEditor.selectedObject.src,
								oEditor.selectedObject.width,
								oEditor.selectedObject.height
							);
						}
						this.currentBrush = sBrush;
						//Remove old
						oEditor.map.objects[sIndex] = (oEditor.selectedObject.name);
						if (oEditor.map.mapData[sIndex]) {
							oEditor.map.mapData[sIndex].parentNode.removeChild(oEditor.map.mapData[sIndex]);
							delete(oEditor.map.mapData[sIndex]);
						}
						oEditor.renderMap(iScrollX, iScrollY);
						//console.info(oEditor.map.tiles);
						oGameState.keys[37] = false;
					} else if ( oGameState.keys[39] ){ //RIGHT
						//Replace old with good grass
						var sIndex = (this.currentIndex1) + '.' + (this.currentIndex0);
						var sBrush = "mmm2";
						this.activeObject = oEditor.selectedObject;
						oEditor.selectedObject = oEditor.objects["Tiles"]["mmm2"];
						//If it doesn't exist make it
						if (!oEditor.map.tiles[sBrush]) {
							oEditor.map.tiles[sBrush] = oEditor.map.createTile(
								oEditor.selectedObject.src,
								oEditor.selectedObject.width,
								oEditor.selectedObject.height
							);
						}
						//Remove old
						oEditor.map.objects[sIndex] = (oEditor.selectedObject.name);
						if (oEditor.map.mapData[sIndex]) {
							oEditor.map.mapData[sIndex].parentNode.removeChild(oEditor.map.mapData[sIndex]);
							delete(oEditor.map.mapData[sIndex]);
						}
						oEditor.renderMap(iScrollX, iScrollY);
						
						//THEN
						oEditor.selectedObject = this.activeObject;
						//Shift active piece RIGHT
						this.currentIndex1++;
						if(this.currentIndex1%2==0)this.currentIndex0++;
						var sIndex = (this.currentIndex1) + '.' + (this.currentIndex0);
						var sBrush = this.currentBrush;
						//If it doesn't exist make it
						if (!oEditor.map.tiles[sBrush]) {
							oEditor.map.tiles[sBrush] = oEditor.map.createTile(
								oEditor.selectedObject.src,
								oEditor.selectedObject.width,
								oEditor.selectedObject.height
							);
						}
						this.currentBrush = sBrush;
						//Remove old
						oEditor.map.objects[sIndex] = (oEditor.selectedObject.name);
						if (oEditor.map.mapData[sIndex]) {
							oEditor.map.mapData[sIndex].parentNode.removeChild(oEditor.map.mapData[sIndex]);
							delete(oEditor.map.mapData[sIndex]);
						}
						oEditor.renderMap(iScrollX, iScrollY);
						//console.info(oEditor.map.tiles);
						oGameState.keys[39] = false;
					
					
					} else if ( oGameState.keys[50] ){ //2
						alert(this.currentBrush);
						
						oGameState.keys[50] = false;
						
						//mmm2 is good grass
					
					
					
					} else {  
						iCaptureX = -1;
						iCaptureY = -1;
					}
					
				/*	if (iNewSecond != iSecond) {
						iSecond = iNewSecond;
						oFPSWindow.innerHTML = 'FPS: ' + iCounter;
						iCounter = 0;
					}*/
				
				})).start();
			});
			
			//loadScene();
		}
		
		function saveFileDialogInit() {
			document.querySelector('.saveFileDialog object').addEventListener('onsave', function() {
				return {
					'data': oEditor.saveMapData(),
					'filename': 'map.xml'
				};
			}.toString());
		}
		
		function XMLtoString(elem){

			var serialized;

			try {
				// XMLSerializer exists in current Mozilla browsers
				serializer = new XMLSerializer();
				serialized = serializer.serializeToString(elem);
			} 
			catch (e) {
				// Internet Explorer has a different approach to serializing XML
				serialized = elem.xml;
			}

			return serialized;
		}
		
		
		
		function openFileDialogInit() {
			document.querySelector('.openFileDialog object').addEventListener('onload', function(sData) {
				console.log("First: ");
				console.log(sData);
				console.log("Second: ");
				
				if (window.XMLHttpRequest)
				  {// code for IE7+, Firefox, Chrome, Opera, Safari
				  xmlhttp=new XMLHttpRequest();
				  }
				else
				  {// code for IE6, IE5
				  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
				  }
				xmlhttp.open("GET","mapDN2.xml",false);
				xmlhttp.send();
				xmlDoc=xmlhttp.responseXML;
				
				console.log("and this now ");
				console.log(xmlDoc);
				console.log("but finally this");
				console.log(XMLtoString(xmlDoc));
				oEditor.loadMapData(XMLtoString(xmlDoc));
			}.toString());
		}
		
		function gameEvent(gameEventNum){
			switch (gameEventNum){
			case 2:
				alert("Hello tree!");
				break;
			case 3:
				alert("Clefairy says 'I don't know how to swim!'");
				break;
			default: break;
			
			}
		}
		