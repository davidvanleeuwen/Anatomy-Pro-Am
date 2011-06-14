components.drawing = function(){
	console.log('loaded drawing');
	window.invitation = {};
	window.pendingMessages = 0;
	window.ComputerView = Backbone.View.extend({
		el: $('#game'),
		events: {
			'click #back_to_cases': 'goBack',
			'click #current_case_info_open': 'expandInfo', //added to allow current case info roll down
			'click #current_case_info_close': 'retractInfo', //added to allow current case info roll up
			'click #expand_collapse_button':'chatExpandRetract',
			'click #chat_notification' : 'chatExpandRetract',
			"mousedown .scanvas": "startLine",
			"mousemove .scanvas" : "drawLine",
			"mouseup .scanvas": "endLine",
			"mouseout .scanvas": "endLine",
			"mouseover .scanvas": "cursorChangeIn",
			"mouseout .scanvas": "cursorChangeOut",
			"change .slider": "changeLayer",
			'click #invite_friends':'inviteFriends',
			'click #hide_drawing':'hideDrawing',
			'click #reset_drawing':'resetDrawing',
			"click #drawingTool": "drawTool",
			"click #erasingTool": "eraseTool",
			'click #team_tab':'teamTab',
			'click #online_tab':'onlineTab',
			'click #friends_tab':'friendsTab',
			'click #undoTool': 'undoTool',
			'click #send_chat':'sendChat',
			'keyup #type':'sendChat',
			'click #score_button':'scoreButton',
			"click #done_button": "doneButton",
			"click #accept_invite":"pagerAcceptInvite",
			"click #decline_invite":"pagerDeclineInvite",
			"click #invite":"invite",
			"click #dont_invite":"dontInvite",
			'click #cursorTool':'cursorTool',
			'click #zoomInTool':'zoomIn',
			'click #zoomOutTool':'zoomOut',
			'mousemove #scan_container': 'cursorMovement',
			'click #open_leaderboard_button':'openLeaderboardButton',
			'click #close_scorecard_button':'closeScorecardButton'
		},
		initialize: function(caseNum) {
			console.log (caseNum);
			window.dThis=this;
			_.bindAll(this, 'render', 'newCursorPosition');
			
			this.zoom = 1;
			this.locked = false;
			this.chatExpanded = false;
			this.infoExpanded = false;
			this.cursorToolEnabled = true;
			this.caseNum = caseNum;
			this.everyoneDone = false;
			this.hideEveryone = false;
			this.render();
			//online_friends.bind('change', this.collectionChanged);
		},
		render: function() {
			if (view.computer) {
				this.el.html('');
				this.el.html(view.computer);
				this.setupView();
			} else {
				$.get('/renders/computer2.html', function(t){
					this.el.html('');
					view.computer = t;
					this.el.html(view.computer);
					this.setupView();
				}.bind(this));
			}
		},
		setupView: function() {
			window.friendbar = new FriendBar;
			this.canvasArr = {};
			this.ctxArr = {};
			this.index = 0;
			var self = this;
			online_friends.each(function(item){
				var playerID = item.get('id');
				//document.getElementById('scan').innerHTML += '<canvas class="scanvas" id="scanvas" height="325" width="431" style="position: absolute; top:'+(1*(self.index*100+50))+';left:250; z-index: 5"></canvas>';
				self.canvasArr[playerID] = ($('canvas')[9-self.index]);
				self.ctxArr[playerID] = self.canvasArr[playerID].getContext("2d");
				self.ctxArr[playerID].globalCompositeOperation = "copy"; //Needed to erase 
				self.ctxArr[playerID].lineCap = "butt"; 
				self.index++;
			});
			this.ctxArr[me.id].globalCompositeOperation = "copy";
			
			this.canvas = $('canvas')[10];
			this.ctx = this.canvas.getContext("2d");
			this.isErasing = false;
			
			/* Retreive chat messages */
			remote.getChatHistoryForActivity(me.get('current_case_id'), emit);
			
			/* Retrieve my color */
			remote.getColor(me.get('current_case_id'), me.get('id'), emit);
			
			/*********************************************
			*               Event listeners              *
			*********************************************/
			
			em.on('playerLeft', function (player_id){
				online_friends.fetch();
			});
			em.on('playerIsDone', function (player){
					online_friends.get(player.id).set({isDone:true});
			}.bind(this));
			em.on('playerSubmitted', function (player){
					online_friends.get(player.id).set({hasSubmitted:true});
			}.bind(this));
			em.on('playerNotDone', function (player){
				if (player.current_case_id == me.get('current_case_id')){
					online_friends.get(player.id).set({isDone:false});
					online_friends.get(player.id).set({hasSubmitted:false});
					this.everyoneDone = false;
					this.$('#score_button').removeClass('red_button');
					this.$('#score_button').addClass('red_button_disabled');
				}
			}.bind(this));
			em.on('everyoneIsDone', function (player){
				if (player.current_case_id == me.get('current_case_id')){
					this.everyoneDone = true;
					this.$('#score_button').addClass('red_button');
					this.$('#score_button').removeClass('red_button_disabled');
				}
			}.bind(this));
			em.on('scoreEveryone', function (player){
				if (player.current_case_id == me.get('current_case_id')){
					this.score_card_template = _.template($('#score_card_template').html());
					$("#score_popup_tag").html(this.score_card_template());
					$("#score_popup_tag").show();
					this.done();
				}
			}.bind(this));
			em.on('setColor', function (color){
				me.set({player_color:color.payload},{silent: true});
				online_friends.get(me.get('id')).set({player_color:color.payload},{silent: true});
				online_friends.fetch();
			});
			em.on('pointColored', function (player_id, points) {
				if (online_friends.get(player_id).get('layer_enabled')){
					if(player_id != me.id)
						this.localDrawEvent(points, online_friends.get(player_id).get('player_color'), this.ctxArr[player_id]);	
				}
			}.bind(this));
			
			em.on('canvasCleared', function (player_id, player_layer) {
				//this.ctxArr[ctxKey].clearRect(0, 0, this.canvas.width, this.canvas.height);
				if (layer == player_layer){
					if (this.ctxArr[player_id] != null && this.ctxArr[player_id] != undefined){
						this.ctxArr[player_id].clearRect(0, 0, this.canvas.width, this.canvas.height);	
						this.canvasArr[player_id].width =  this.canvasArr[player_id].width;
					}
				}
			}.bind(this));
			em.on('pointErased', function(player_id, points) {
				if (online_friends.get(player_id).get('layer_enabled')){
					if(player_id != me.id)
						this.localEraseEvent(points,  this.ctxArr[player_id]);	
				}
				
			}.bind(this));
			
			
			em.on('mouseDownErase', function(player_id, layer) {
				if (online_friends.get(player_id).get('layer_enabled')){
					if(player_id != me.id)
						this.ctxArr[player_id].globalCompositeOperation = "destination-out"; //Needed to erase 	
				}
				
			}.bind(this));
			
			em.on('mouseUpErase', function(player_id, layer) {
				if (online_friends.get(player_id).get('layer_enabled')){
					if(player_id != me.id){
						
					/*	var imageData=this.ctxArr[player_id].getImageData(0, 0, this.canvas.width*this.zoom, this.canvas.height*this.zoom);
						var pix = imageData.data;
						for(var y = 0; y <imageData.height; y++)
							for(var x = 0; x < imageData.width; x++)
								if(pix[((y*(imageData.width*4)) + (x*4)) + 0]==0 
								&& pix[((y*(imageData.width*4)) + (x*4)) + 1]==0
								&& pix[((y*(imageData.width*4)) + (x*4)) + 2]==0)
								pix[((y*(imageData.width*4)) + (x*4)) + 3]=0;

						this.ctxArr[player_id].clearRect(0, 0, this.canvas.width, this.canvas.height);
						this.ctxArr[player_id].putImageData(imageData, 0, 0);
				*/		this.ctxArr[player_id].globalCompositeOperation = "copy"; //Needed to erase 
						
						
						
						
						}	
				}
				
			}.bind(this));
			
			
			
			em.on('setColoredPointsForThisLayer', function(points){
				if(points) {
					var color = online_friends.get(points.player).get('player_color');
					var pointArr = new Array();
					var playerID = points.player;
					if(!this.canvasArr[playerID]){
						this.canvasArr[playerID] = ($('canvas')[9-this.index]);
						this.ctxArr[playerID] = this.canvasArr[playerID].getContext("2d");
						this.index++;
					}
					for(key in points.payload) {
						if(points.payload[key].point.layer == window.layer)
							pointArr.push(points.payload[key].point);
					}
						this.colorPoint(pointArr, color,this.ctxArr[points.player]);
				}
			}.bind(this));
			//Removed the below function from apps.js, placed here to make it more relevant for the drawing pager.  This will be changed later. 
			em.on('JoinRequest', function(activity_id, case_number, player_id, player_name, player_avatar) {
				invitation['activity_id'] = activity_id;
				invitation['case_number'] = case_number;
				invitation['player_id'] = player_id;
				invitation['player_name'] = player_name;
				invitation['player_avitar'] = player_avatar;
				$('.pager_facebook_image').attr('style', 'background: url(\'' + player_avatar + '?type=normal\') no-repeat; ');
				$('#invitation_text').html('<h3>' + player_name + ' requests your opinion.</h3>');
				console.log ('received invitation');
				this.showPager(true);
			}.bind(this));
			
			// event listener for chat
			em.on('setChatHistory', this.setChatHistory);
			em.on('newChat', this.receiveChat);
			
			em.on('newCursorPosition', this.newCursorPosition);
			
			/*********************************************/
			
			// fixtures for the images (scans):
			console.log (this.caseNum);
			if(this.caseNum == 1){
				var imageRefs = ['/images/cases/case3/1.png', '/images/cases/case3/2.png'];
			}else{
				var imageRefs = ['/images/cases/case1/1.png', '/images/cases/case1/2.png','/images/cases/case1/3.png', '/images/cases/case1/4.png'];
			}
			this.$('#slider_input').attr('style', 'width:' + ((imageRefs.length - 1) * 38));
			
			var slider;
			slider = YAHOO.widget.Slider.getHorizSlider("slider-bg", "slider-thumb", 0, (imageRefs.length - 1) * 40, 40);
			slider.subscribe('change', function(){
				this.changeLayer(slider.getValue() / 40);
			}.bind(this));
			$('#slider-bg').css({'height': 20, 'width':(imageRefs.length) * 33});
			var counter = 0;
			imageRefs.forEach(function(img){
				var distance = (counter * 40) + 5;
				var tickTemplate = '<div class="tick" style="padding-left:' + distance + 'px;">' + (counter + 1) + '</div>';
				this.$('#images').append('<img src="'+img+'" style="display: none; vertical-align: center;" />');
				this.$('#tick_holder').append(tickTemplate);
				counter++;
			});
			

			layers = this.$('#images').children();
			$(layers[0]).show();
			// refactor to put images/slides/layers ?? into models/collections with attribute active: true
			window.layer = 0;
			remote.getColoredPointsForThisLayerAndPlayer(me.get('current_case_id'), me.get('id'), me.get('id'), layer, emit);
		},
		removeAllListeners: function() {
			em.removeAllListeners('pointColored');
			em.removeAllListeners('playerLeft');
			em.removeAllListeners('canvasCleared');
			em.removeAllListeners('pointErased');
			em.removeAllListeners('setColoredPointsForThisLayer');
			em.removeAllListeners('JoinRequest');
			em.removeAllListeners('setChatHistory');
			em.removeAllListeners('newChat');
			em.removeAllListeners('newCursorPosition');
			em.removeAllListeners('playerNotDone');
			em.removeAllListeners('everyoneIsDone');
			em.removeAllListeners('scoreEveryone');
		},
		canvasMerge: function() {
			/*Function is presently not necessary
			
			
			var pixArr = new Array();
			var imageData;
			//console.log("Merging time");
			for(ctxKey in this.ctxArr){
				//console.log(this.ctxArr[ctxKey]);
				imageData=this.ctxArr[ctxKey].getImageData(0, 0, this.canvas.width, this.canvas.height);
				pixArr.push(imageData.data);
			}	
			
			imageData=this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
			var pix = imageData.data;
		
			for(var c = 0; c < (pix.length)/4; c++)
				for(pixT in pixArr)
					if(pixT[c*4+3]!=0){
						pix[c*4+0]=0;
						pix[c*4+1]=0;
						pix[c*4+2]=255;
						pix[c*4+3]=pixT[c*4+3];
					}
			
						this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
						this.ctx.putImageData(imageData, 0, 0);
				
				
				*/
		
			
		},
		openLeaderboardButton: function(e){
			e.preventDefault();
			this.goBack(e);
		},
		closeScorecardButton: function (e){
			e.preventDefault();
			this.goBack(e);
		},
		goBack: function(e) {
			e.preventDefault();
			remote.leftActivity (me.get('current_case_id'), me);
			me.set({current_case_id:0},{silent:true});
			delete this;
			new CaseView();
		},
		colorPoint: function(points, color, context) {
			var imageData=context.getImageData(0, 0, this.canvas.width*this.zoom, this.canvas.height*this.zoom);
			var pix = imageData.data;
			var redVal = (parseInt(color.substr(0,2),16));
			var greenVal = (parseInt(color.substr(2,2),16));
			var blueVal = (parseInt(color.substr(4,2),16));
			for(var c = 0; c < points.length; c++){
				var point = points[c];
				var x = point.x;
				var y = point.y; 
				var slide = point.layer;
				if(layer == slide) {
					if(x>0&&y>0){
						if(this.zoom == 1){
							pix[((y*(imageData.width*4)) + (x*4)) + 0]=redVal;
							pix[((y*(imageData.width*4)) + (x*4)) + 1]=greenVal;
							pix[((y*(imageData.width*4)) + (x*4)) + 2]=blueVal;
							pix[((y*(imageData.width*4)) + (x*4)) + 3]=255;
						}else if(this.zoom == 2){
							pix[(((2*y+0)*(imageData.width*4)) + ((2*x+0)*4)) + 0]=redVal;
							pix[(((2*y+0)*(imageData.width*4)) + ((2*x+0)*4)) + 1]=greenVal;
							pix[(((2*y+0)*(imageData.width*4)) + ((2*x+0)*4)) + 2]=blueVal;
							pix[(((2*y+0)*(imageData.width*4)) + ((2*x+0)*4)) + 3]=255;
							pix[(((2*y+0)*(imageData.width*4)) + ((2*x+1)*4)) + 0]=redVal;
							pix[(((2*y+0)*(imageData.width*4)) + ((2*x+1)*4)) + 1]=greenVal;
							pix[(((2*y+0)*(imageData.width*4)) + ((2*x+1)*4)) + 2]=blueVal;
							pix[(((2*y+0)*(imageData.width*4)) + ((2*x+1)*4)) + 3]=255;
							pix[(((2*y+1)*(imageData.width*4)) + ((2*x+0)*4)) + 0]=redVal;
							pix[(((2*y+1)*(imageData.width*4)) + ((2*x+0)*4)) + 1]=greenVal;
							pix[(((2*y+1)*(imageData.width*4)) + ((2*x+0)*4)) + 2]=blueVal;
							pix[(((2*y+1)*(imageData.width*4)) + ((2*x+0)*4)) + 3]=255;
							pix[(((2*y+1)*(imageData.width*4)) + ((2*x+1)*4)) + 0]=redVal;
							pix[(((2*y+1)*(imageData.width*4)) + ((2*x+1)*4)) + 1]=greenVal;
							pix[(((2*y+1)*(imageData.width*4)) + ((2*x+1)*4)) + 2]=blueVal;
							pix[(((2*y+1)*(imageData.width*4)) + ((2*x+1)*4)) + 3]=255;
						}			
					}
				}
			}
			context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			context.putImageData(imageData, 0, 0);	
		},
		localDrawEvent: function(points,color,context){
			if(layer == points[0].layer){
				context.beginPath();
				context.strokeStyle = '#' + color;
				context.lineWidth = ""+this.zoom; 
				var offset = Math.floor(context.lineWidth/2);
				offset = 0;
				context.moveTo(points[0+offset].x*this.zoom,points[0+offset].y*this.zoom);
				context.lineTo(points[points.length-1-offset].x*this.zoom,points[points.length-1-offset].y*this.zoom);
				context.stroke();
				
			}
		},
		localEraseEvent: function(points,context){
			if(layer == points[0].layer){
				context.globalCompositeOperation = "destination-out";
				context.beginPath();
				var tempStrokeStyle = context.strokeStyle;
				context.strokeStyle = "rgba(0,0,0,1)";
				context.lineWidth = ""+(10);
				var offset = Math.floor(context.lineWidth/2);
				//console.log(points.length-1-offset);
				
				
				context.moveTo(points[0+offset].x*this.zoom,points[0+offset].y*this.zoom);
				context.lineTo(points[points.length-1-offset].x*this.zoom,points[points.length-1-offset].y*this.zoom);
				context.stroke();
				context.strokeStyle = tempStrokeStyle;
				context.globalCompositeOperation = "copy";
				
			}
		},
		zoomIn: function(event){
			event.preventDefault();
			if(this.zoom == 1){
				this.zoom = 2;
				for(arrKey in this.ctxArr){
					//this.ctxArr[arrKey].scale(2.0,2.0);
					this.ctxArr[arrKey].clearRect(0, 0, this.canvas.width*this.zoom, this.canvas.height*this.zoom);
				}		
				for(arrKey in this.canvasArr){
					//this.ctxArr[arrKey].scale(2.0,2.0);
					this.canvasArr[arrKey].width = this.canvasArr[arrKey].width;
				}		
				
						
				this.zoomXOffset = event.clientX-this.canvas.offsetLeft+3;
				this.zoomYOffset = event.clientY-this.canvas.offsetTop+29;
				this.getColorPointsForLayerAndPlayer(false);
				
				
				this.$('#scan_container').css('overflow', "scroll");
				
				
				
				var halfHeight = Math.floor(this.$('#scan_container').attr('scrollHeight')/4);
				var halfWidth = Math.floor(this.$('#scan_container').attr('scrollWidth')/4);
				
				
				//console.log("test time");
				//console.log(layers);
				//console.log("lets go!");
				
				
				
				for(arrKey in layers){
					layers[arrKey].height *= 2;
					
					//layers[arrKey].width *= 2;
					
				}
				//console.log(this.$('#images')[0]);
				this.$('#images')[0].style.left=0;
				this.$('#scan_container')[0].scrollTop = halfHeight;
				this.$('#scan_container')[0].scrollLeft = halfWidth;
				
				this.$('#scan_container')[0].scrollTop = halfHeight;
				this.$('#scan_container')[0].scrollLeft = halfWidth;
				
				
				}
			
		},
		zoomOut: function(event){
			event.preventDefault();
			if(this.zoom == 2){
				for(arrKey in this.ctxArr){
					//this.ctxArr[arrKey].scale(.5,.5);
					this.ctxArr[arrKey].clearRect(0, 0, this.canvas.width*this.zoom, this.canvas.height*this.zoom);
				}
				
				for(arrKey in this.canvasArr){
					//this.ctxArr[arrKey].scale(2.0,2.0);
					this.canvasArr[arrKey].width = this.canvasArr[arrKey].width;
				}
				
				this.zoom = 1;
			
				for(arrKey in layers){
					layers[arrKey].height /= 2;
					
				}
				
				this.$('#images')[0].style.left=0;
				
				
			}
			
			this.$('#scan_container')[0].scrollTop = 0;
			this.$('#scan_container')[0].scrollLeft = 0;
			this.$('#scan_container').css('overflow', "hidden");
			this.getColorPointsForLayerAndPlayer(false);
		},
		cursorChangeIn: function(event) {
			
			if(this.isErasing){
				document.body.style.cursor='url(images/eraser_cursor-2.cur)';
			}else{
				document.body.style.cursor='url(images/brush_cursor-2.cur)';
				
			} 
		},
		cursorChangeOut: function(event) {
			document.body.style.cursor='default';
		},
		erasePoint: function(points,context) {
			var imageData=context.getImageData(0, 0, this.canvas.width*this.zoom, this.canvas.height*this.zoom);
			var pix = imageData.data;
			for(var c = 0; c < points.length; c++){
				var point = points[c];
				var x = point.x;
				var y = point.y; 
				var slide = point.layer;
				if(layer == slide) {
					if(x>0&&y>0){
						if(this.zoom == 1){
							pix[((y*(imageData.width*4)) + (x*4)) + 3]=0;
						}else if(this.zoom == 2){
							pix[(((2*y+0)*(imageData.width*4)) + ((2*x+0)*4)) + 3]=0;
							pix[(((2*y+0)*(imageData.width*4)) + ((2*x+1)*4)) + 3]=0;
							pix[(((2*y+1)*(imageData.width*4)) + ((2*x+0)*4)) + 3]=0;
							pix[(((2*y+1)*(imageData.width*4)) + ((2*x+1)*4)) + 3]=0;
						}			

					}
				}
			}
			context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			context.putImageData(imageData, 0, 0);		
		},
		startLine: function(event) {
			event.preventDefault();
			
				if(this.isErasing){
					this.ctxArr[me.id].globalCompositeOperation = "destination-out"; //Needed to erase 
				//	remote.mouseDownErase(me.get('current_case_id'), me.id, layer);
				}
				this.isDrawing = true;
				this.oldX = event.clientX-this.canvas.offsetLeft+3;
				this.oldY = event.clientY-this.canvas.offsetTop+29;
			
			
		},
		removeDuplicateElement: function(arrayName){
		        var newArray=new Array();
		        for(var i=0; i<arrayName.length;i++ )
		        {  
					var j;
		          for(j=0; (newArray[j]!=arrayName[i]) && j<newArray.length;j++ );
		          if(j==newArray.length) newArray[newArray.length] = arrayName[i];
		        }
		        return newArray;
		},
		drawLine: function(event) {
			event.preventDefault();
			if(this.isDrawing && !this.locked) {
				var leftOffset = Math.floor(this.$('#scan_container')[0].scrollLeft/2);
				var topOffset = Math.floor(this.$('#scan_container')[0].scrollTop/2);
				//var leftOffset = 0;
				//var topOffset = 0;
				if(this.isErasing){
					var xvar = event.clientX-this.canvas.offsetLeft+3;
					var yvar = event.clientY-this.canvas.offsetTop+29;
					var points = new Array();
					var delX = (xvar-this.oldX);
					var delY = (yvar-this.oldY);
					var arrayPos = 0;
					if(Math.abs(delX)>Math.abs(delY)){
						var stepCount = Math.abs(delX);
						var isVertical = true;
					}else{
						var stepCount = Math.abs(delY);
						var isVertical = false;
					}
					for(var c = 0; c <= stepCount; c++){
						var curX = Math.floor(this.oldX+(delX/stepCount)*(c+1));
						var curY = Math.floor(this.oldY+(delY/stepCount)*(c+1));
						if(isVertical){
							for (var ySubset = curY-4; ySubset < curY+4; ySubset++)
								if(ySubset>0 && ySubset<this.canvas.height){
									points[arrayPos] = {x: (Math.floor(curX/this.zoom)+leftOffset),
										y:  (Math.floor(ySubset/this.zoom)+topOffset),
										layer: layer};
									arrayPos++;
								}
						}else{
							for (var xSubset = curX-4; xSubset < curX+4; xSubset++)
								if(xSubset>0 && xSubset<this.canvas.width){
									points[arrayPos] = {x:  (Math.floor(xSubset/this.zoom)+leftOffset),
										y: (Math.floor(curY/this.zoom)+topOffset),
										layer: layer};
									arrayPos++;
								}
						}
					}
					this.oldX = xvar;
					this.oldY = yvar;
			
					remote.pointErased(me.get('current_case_id'), me.id, points);
					this.localEraseEvent(points, this.ctxArr[me.id]);
					

					
				}else{
					var xvar = event.clientX-this.canvas.offsetLeft+3;
					var yvar = event.clientY-this.canvas.offsetTop+29;
					var points = new Array();
					var delX = (xvar-this.oldX);
					var delY = (yvar-this.oldY);
					var arrayPos = 0;
					if(Math.abs(delX)>Math.abs(delY)){
						var stepCount = Math.abs(delX);
						var isVertical = true;
					}else{
						var stepCount = Math.abs(delY);
						var isVertical = false;
					}
					for(var c = 0; c <= stepCount; c++){
						var curX = Math.floor(this.oldX+(delX/stepCount)*(c+1));
						var curY = Math.floor(this.oldY+(delY/stepCount)*(c+1));
						var penWidth = 1;
						if(isVertical){
							for (var ySubset = curY-Math.floor(penWidth/2); ySubset < curY+penWidth-Math.floor(penWidth/2); ySubset++)
								if(ySubset>0 && ySubset<this.canvas.height){
									points[arrayPos] = {x:  (Math.floor(curX/this.zoom)+leftOffset),
										y:  (Math.floor(ySubset/this.zoom)+topOffset),
										layer: layer};
									arrayPos++;
								}
						}else{
							for (var xSubset = curX-Math.floor(penWidth/2); xSubset < curX+penWidth-Math.floor(penWidth/2); xSubset++)
								if(xSubset>0 && xSubset<this.canvas.width){
									points[arrayPos] = {x:  (Math.floor(xSubset/this.zoom)+leftOffset),
										y:  (Math.floor(curY/this.zoom)+topOffset),
										layer: layer};
									arrayPos++;
								}
						}
					}
					this.oldX = xvar;
					this.oldY = yvar;
					
					//this.drawLocally(points);

					remote.pointColored(me.get('current_case_id'), me.id, points);
					this.localDrawEvent(points, me.get('player_color'), this.ctxArr[me.id]);	

				
					
				}
			}
		},
		drawTool: function(event) {
			event.preventDefault();
			this.isErasing = false;
			//this.$('#drawingTool').attr('style', 'background:' + online_friends.get(me.id).get('player_color'));
			//this.$('#erasingTool').attr('style', 'background: #FFFFFF');
			this.clearButtonStyles();
			this.$('#drawingTool').addClass('red_button_active');
			this.$('#erasingTool').addClass('red_button');

		},
		eraseTool: function(event) {
			event.preventDefault();
			this.isErasing = true;
			//this.$('#erasingTool').attr('style', 'background:' + online_friends.get(me.id).get('player_color'));
			//this.$('#drawingTool').attr('style', 'background: #FFFFFF');
			this.clearButtonStyles();
			this.$('#erasingTool').addClass('red_button_active');
			this.$('#drawingTool').addClass('red_button');
		},
		clearButtonStyles : function (){
			console.log ("thearlaskjf");
			this.$('#drawingTool').removeClass('red_button_active');
			this.$('#erasingTool').removeClass('red_button_active');
			this.$('#drawingTool').removeClass('red_button');
			this.$('#erasingTool').removeClass('red_button');	

		},
		endLine: function(event) {
			event.preventDefault();
			
			if(this.ctxArr[me.id].globalCompositeOperation != "copy"){
				
				
				this.ctxArr[me.id].globalCompositeOperation = "copy";
			/*	var imageData=this.ctxArr[me.id].getImageData(0, 0, this.canvas.width*this.zoom, this.canvas.height*this.zoom);
				var pix = imageData.data;
				for(var y = 0; y <imageData.height; y++)
					for(var x = 0; x < imageData.width; x++)
						if(pix[((y*(imageData.width*4)) + (x*4)) + 0]==0 
						&& pix[((y*(imageData.width*4)) + (x*4)) + 1]==0
						&& pix[((y*(imageData.width*4)) + (x*4)) + 2]==0)
						pix[((y*(imageData.width*4)) + (x*4)) + 3]=0;
					
				this.ctxArr[me.id].clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.ctxArr[me.id].putImageData(imageData, 0, 0);
				remote.mouseUpErase(me.get('current_case_id'), me.id, layer);
			*/
			}
			
			this.isDrawing = false;
			
		},
		changeLayer: function(sliderValue) {
			if(sliderValue != layer){
			  // remove all cursors
			  $('.cursors').each(function(i, el) {
			    $(el).remove();
			  });
			  
				layer = sliderValue;
				for(ctxKey in this.ctxArr){
					this.ctxArr[ctxKey].clearRect(0, 0, this.canvas.width, this.canvas.height);
				}
				for(arrKey in this.canvasArr){
					this.canvasArr[arrKey].width = this.canvasArr[arrKey].width;
				}
				
				layers.each(function(n, el){
					if(layer != n) {
						$(el).hide();
					} else {
						$(el).show();
						$('#slide').html('#'+(n+1));
					}
				});
				this.getColorPointsForLayerAndPlayer(false);
			}
		},
		arrayMin: function(array) {
			var curMin = array[0];
			for(var c = 1; c < array.length; c++)
				if(curMin > array[c])curMin = array[c];
			return curMin;
		},
		bwcc: function(imageData){
			//Bwconncomp old version
			//Takes matrtix as input
			//Returns label matrix with uniquely labeled regions 
			var width = imageData.width;
			var height = imageData.height;
			var nextLabel = 0;
			var pix = imageData.data;

			var linked = new Array();
			var typeMatrix = new Array();
			
			console.log("X: " + width + ", Y: " + height);
			for(var y = 0; y < height; y++){
				//console.log("y and height is");
				//console.log(y);
				for(var x = 0; x < width; x++){

					 if((x>0 && y>0)
					 && (pix[((y*(width*4)) + ((x-1)*4)) + 3]==pix[((y*(width*4)) + (x*4)) + 3])
					 && (pix[(((y-1)*(width*4)) + (x*4)) + 3]==pix[((y*(width*4)) + (x*4)) + 3])
					 && (typeMatrix[y*(width) + x-1] != typeMatrix[(y-1)*(width) + x])){
						//console.log("here before crash1");
						var mergeLinked = this.removeDuplicateElement(linked[typeMatrix[y*(width) + x-1]].concat(linked[typeMatrix[(y-1)*(width) + x]]));
						linked[typeMatrix[y*(width) + (x-1)]]=mergeLinked;
			            linked[typeMatrix[(y-1)*(width) + x]]=mergeLinked;
			            typeMatrix[y*(width) + x] = Math.min(typeMatrix[y*(width) + (x-1)],typeMatrix[(y-1)*(width) + x]);
			         }else if((x>0)
			 		 && (pix[((y*(width*4)) + ((x-1)*4)) + 3]==pix[((y*(width*4)) + (x*4)) + 3])){
						//console.log("here before crash2");
						typeMatrix[y*(width) + x] = typeMatrix[y*(width) + (x-1)];
			         }else if((y>0)
			 		 && (pix[(((y-1)*(width*4)) + (x*4)) + 3]==pix[((y*(width*4)) + (x*4)) + 3])){
						//console.log("here before crash3");
						typeMatrix[y*(width) + x] = typeMatrix[(y-1)*(width) + x];
			         }else{
						//console.log("here before crash4");
						linked[nextLabel] = [nextLabel];  
						//if(nextLabel < 5) console.log(linked);
			            typeMatrix[y*(width) + x]  = nextLabel;
			            nextLabel = nextLabel + 1;
			         }
				}
			}
			//console.log("mad it here1");
			//console.log(linked);
			for(var y = 0; y < height; y++){
				for(var x = 0; x < width; x++){
					var temp = linked[typeMatrix[y*(width) + x]];
					//console.log(typeMatrix[y*(width) + x]);
					typeMatrix[y*(width) + x] = this.arrayMin(temp);

					//console.log(linked[typeMatrix[y*(width) + x]].length );
				}
			}	
			//console.log("now here");
			//console.log(typeMatrix);
			//console.log("even here");
			return typeMatrix;
		},
		scoreButton: function(e){
			e.preventDefault();
			if (this.everyoneDone){
				remote.submitScore(me.get('current_case_id'), me);
			}else{
				//do nothing
			}
			
		},
		doneButton: function (e){
			e.preventDefault();
			this.locked = !this.locked;
			if (this.locked){
				remote.done(me.get('current_case_id'), me);
				this.getColorPointsForLayerAndPlayer(true);
				$('#done_text').text('UNLOCK');
			}else{
				remote.notDone(me.get('current_case_id'),me);
				$('#done_text').text("I'M DONE");
			}
		},
		done: function() {
			var self = this;
			var totalScore = 0;
			var totalPlayers = 0;
			online_friends.each(function(friend){
				if (friend.get('current_case_id') == me.get('current_case_id')){
					totalPlayers++;
					var nameString = '<li><span style="color:#' + friend.get("player_color") + '">' + friend.get("name") + '</span></li>';
					var scoreString = '<li><span class="des_cancer" id="hit_' + friend.get("id") + '"> 0 </span> - <span class="des_healthy" id="missed_' + friend.get("id") + '">0</span> = <span id="total_' + friend.get("id") + '" style="color:#' + friend.get('player_color') + '">0</span></li>';
					$("#score_names_ul").append(nameString);
					$("#score_number_ul").append(scoreString);
				}
			});
			
			online_friends.each(function(friend){
				if (friend.get('current_case_id') == me.get('current_case_id')){
					var scoreHit = 0;
					var scoreMissed = 0;
					var color = friend.get('player_color');
					var context = this.ctxArr[friend.get('id')];
					var imageData=context.getImageData(0, 0, this.canvas.width, this.canvas.height);
					var pix = imageData.data;
					var redVal = (parseInt(color.substr(0,2),16));
					var greenVal = (parseInt(color.substr(2,2),16));
					var blueVal = (parseInt(color.substr(4,2),16));
					var typeMatrix = this.bwcc(imageData);

					//Replace former with latter

					for(var y = 0; y < imageData.height; y++){
						for(var x = 0; x < imageData.width; x++){
							if(typeMatrix[y*(imageData.width) + x] == 0){
								pix[((y*(imageData.width*4)) + (x*4)) + 3]=0;
							}else{	
									pix[((y*(imageData.width*4)) + (x*4)) + 0]=redVal;
									pix[((y*(imageData.width*4)) + (x*4)) + 1]=greenVal;
									pix[((y*(imageData.width*4)) + (x*4)) + 2]=blueVal;
									pix[((y*(imageData.width*4)) + (x*4)) + 3]=100;
							}
						}
					}
					context.clearRect(0, 0, this.canvas.width, this.canvas.height);
					context.putImageData(imageData, 0, 0);
					for(var y = 0; y < imageData.height; y++){
						for(var x = 0; x < imageData.width; x++){
							if((x > (imageData.width/6) && x < (2*imageData.width/6))
								&& (y > (imageData.height/6) && y < (2*imageData.height/6))){
									if(pix[((y*(imageData.width*4)) + (x*4)) + 3]== 100){ 
										scoreHit++;
									}else{
										scoreMissed++;
									}
									$('#hit_' + friend.get("id")).text(scoreHit);
									$('#missed_' + friend.get("id")).text(scoreMissed / 4);
									$('#total_' + friend.get("id")).text(scoreHit - (scoreMissed / 4));
							}
						}
					}
					totalScore += (scoreHit - (scoreMissed * .25));
					//alert("Your score " + scoreHit + " out of: " + (scoreHit+scoreMissed) + " or " + (100*scoreHit/(scoreHit+scoreMissed) + "%"));
				}
			}.bind(this));
			var t = 0;
			$("#numbers_total_ul").append('<li>' + (totalScore / totalPlayers) + '</li>');
		},
		expandInfo: function (e) { //added to allow current case info roll down
			e.preventDefault();
			this.infoExpanded = !this.infoExpanded;
			if (this.infoExpanded){
				this.$('#current_info_container').show();
			}else{
				this.$('#current_info_container').hide();	
			}
		},
		retractInfo: function (e) { //added to allow current case info roll up
			e.preventDefault();
			this.expandInfo(e);
		},
		undoTool: function (e) { //added to allow undo functions
			e.preventDefault();
			//TODO - Allow for Undo
		},
		inviteFriends: function (e){ // added to allow invitation of friends
			e.preventDefault();
			FB.ui({method: 'apprequests',  message: me.get('name') + " needs your help with a tough case!", title: "Help!"});
		},
		hideDrawing: function (e){ //added to allow hiding of all drawings 
			e.preventDefault();
			this.hideEveryone = !this.hideEveryone
			if (this.hideEveryone){
				this.saveListState(e);
				$("#hide_drawing").html("<a href=''><span>SHOW DRAWINGS</span></a>");
				online_friends.each(function(friend){
					if (friend.get('layer_enabled')){
						window.dThis.ctxArr[friend.get('id')].clearRect(0, 0, window.dThis.canvas.width, window.dThis.canvas.height);
						friend.toggleVisibility();
					}
				});
			}else{	
				$("#hide_drawing").html("<a href=''><span>HIDE DRAWINGS</span></a>");
				_.each(listState, function(friend){
					console.log (friend);
					online_friends.get(friend.id).set({layer_enabled: friend.layer_enabled});
				});
				this.getColorPointsForLayerAndPlayer(true);
			}
		},
		resetDrawing: function (e){ //added to allow reset of entire drawing (clear all my points)
			e.preventDefault();
			remote.clearCanvas (me.get('current_case_id'), me.get('id'), layer);
		},
		teamTab: function (e){ // added to allow team tab clicking
			if (e != null && e != undefined){
				e.preventDefault();
			}
			currentView = 0;
			friendbar = new FriendBar;
			this.$('#team_tab').attr('style','background: url(../images/tab_bg_active.png) repeat-x');
			this.$('#online_tab').attr('style','background: url(../images/tab_bg.png) repeat-x');
			this.$('#friends_tab').attr('style','background: url(../images/tab_bg.png) repeat-x');
		},
		onlineTab: function (e){ //added to allow online tab clicking
			e.preventDefault();
			this.saveListState();
			currentView = 1;
			friendbar = new FriendBar;
			this.$('#team_tab').attr('style','background: url(../images/tab_bg.png) repeat-x');
			this.$('#online_tab').attr('style','background: url(../images/tab_bg_active.png) repeat-x');
			this.$('#friends_tab').attr('style','background: url(../images/tab_bg.png) repeat-x');
		},
		friendsTab: function (e){
			e.preventDefault();
			this.saveListState();
			currentView = 2;
			friendBar = new FriendBar;
			this.$('#friends_tab').attr('style','background: url(../images/tab_bg_active.png) repeat-x');
			this.$('#online_tab').attr('style','background: url(../images/tab_bg.png) repeat-x');
			this.$('#team_tab').attr('style','background: url(../images/tab_bg.png) repeat-x');
		},
		saveListState: function (e) {
			if (currentView == 0){
				listState = {}
				online_friends.each (function (f){
					listState[f.get ('id')] = {id: f.get('id'), layer_enabled: f.get('layer_enabled')};
					console.log (f.get('layer_enabled'));
				});
			}
		},
		sendChat: function (e){
			e.preventDefault();
			var inputEl = this.$('#type')[0];
			var chatEl = this.$('#chat_window')[0];
			var message = inputEl.value;
			
			if(e.type == "click" || e.keyCode == 13 && message != '') {
				$(chatEl).append('<div class="chat_msg_con"><span class="chat_person" style="color: #'+me.get('player_color')+'; font-weight: bold;">me:</span><span class="chat_message"> '+message.replace(/&/g, "&amp;").replace(/</g,"&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;")+'</span></div>');
				inputEl.value = '';
				chatEl.scrollTop = chatEl.scrollHeight;
				remote.sendChat(me.get('current_case_id'), me.get('id'), layer, message);
			}
		},
		receiveChat: function(player_id, message) {
			var chatEl = $('#chat_window')[0];
			//console.log (dThis.chatExpanded);
			if (!dThis.chatExpanded){
				pendingMessages++;
				if ($('#chat_container').find('#chat_notification').size() == 0) {
					//console.log ('no chat window found');
					this.chat_notification_template = _.template($('#chat_notification_template').html());
					$('#chat_container').append(this.chat_notification_template());
					$('#chat_notification').html('<p>' + pendingMessages + '</p>');
				}else{
					$('#chat_notification').html('<p>' + pendingMessages + '</p>');
				}
			}
	      	if(player_id != me.get('id')) {
		        var player = online_friends.filter(function(chatFriend) { return chatFriend.get('id') === player_id });
				$('#cursor_'+player_id+' .cursor_blob').html(message);
		        $('#chat_window').append('<div class="chat_msg_con"><span class="chat_person" style="color: #'+player[0].get('player_color')+'; font-weight: bold;">'+player[0].get('name')+':</span><span class="chat_message"> '+message+'</span></div>');
		        chatEl.scrollTop = chatEl.scrollHeight;
			}
		},
		setChatHistory: function(data) {
		  var chatEl = $('#chat_window')[0];
      _.each(data.payload, function(message) {
        var player = online_friends.filter(function(chatFriend) { return chatFriend.get('id') === message.player });
        $('#chat_window').append('<div class="chat_msg_con"><span class="chat_person" style="color: #'+player[0].get('player_color')+'; font-weight: bold;">'+player[0].get('name')+':</span><span class="chat_message"> '+message.message+'</span></div>');
        chatEl.scrollTop = chatEl.scrollHeight;
      });
		},
		showPager: function (b){
			if(b){
				this.$(".pager").show();
			}else{	
				this.$(".pager").hide();
			}
		},	
		pagerAcceptInvite: function (e){
			e.preventDefault();
			console.log ('received case id ' + invitation['case_number'] + " activity " + invitation['activity_id']);
			remote.joinActivity(invitation['activity_id'], me);
			me.set({current_case_id: invitation['activity_id']}, {silent:false});
			online_friends.each(function (friend){
				if (friend.get('id') == me.get('id')){
					friend.set({current_case_id: invitation['activity_id']}, {silent:false});
					console.log ('changed friend case id');
				}
			});
			this.removeAllListeners();
			currentView = 0;
			console.log (invitation['case_number']);
			delete this;
			new ComputerView(invitation['case_number']);
			invitation = {};
		},
		pagerDeclineInvite: function (e){
			e.preventDefault();
			showPager (false);
		},
		chatExpandRetract: function (e){
			e.preventDefault();
			console.log (this.chatExpanded);
			this.chatExpanded = !this.chatExpanded;
			if(this.chatExpanded){
				this.$('#chat_container').attr('style', 'margin: 100px 0px 0px 0px');
				pendingMessages = 0;
				$('#chat_notification').remove();
			}else{
				this.$('#chat_container').attr('style', 'margin:100px 0px 0px -193px;');
			}
		},
		invite: function (e) {
			e.preventDefault();
			var inv_id = invited['player_id']
			var inv_name = me.get('name')
			var inv_avatar = me.get('avatar')
			remote.sendJoinRequest('JoinRequest', me.get('current_case_id'), inv_id, inv_name, inv_avatar);
			this.$('.invite_popup').hide();
		},
		dontInvite: function (e) {
			e.preventDefault();
			this.$('.invite_popup').hide();
		},
		getColorPointsForLayerAndPlayer: function(showAll) {
			if(showAll) {
				if(this.locked) {
					online_friends.each(function(friend){
						if (!friend.get('layer_enabled') && friend.get('current_case_id') == me.get('current_case_id')){
							friend.toggleVisibility();
							remote.getColoredPointsForThisLayerAndPlayer(me.get('current_case_id'), me.get('id'), friend.get('id'), layer, emit);
						}
					});
				} 
			} else {
				online_friends.each(function(friend){
					if (friend.get('layer_enabled')){
						remote.getColoredPointsForThisLayerAndPlayer(me.get('current_case_id'), me.get('id'), friend.get('id'), layer, emit);
					}
				});
			}
		},
		cursorTool: function(e) {
		    e.preventDefault();
		    this.cursorToolEnabled = !this.cursorToolEnabled;
		    if(!this.cursorToolEnabled) {
		      $('.cursors').each(function(i, el) {
  			    $(el).remove();
  			  });
		    }
		},
		cursorMovement: _.throttle(function(e) {
		  remote.cursorPosition(me.get('current_case_id'), me.get('id'), layer, {x: e.pageX, y: e.pageY});
		}, 50),
		newCursorPosition: function(player, current_layer, position) {
		  if(player != me.get('id') && online_friends.get(player).get('layer_enabled') && online_friends.get(player).get('current_case_id') == me.get('current_case_id')) {
		    var offset = $('#scan_container').offset();	
			var color = online_friends.get(player).get('player_color');
		    if(position.x-6 >= offset.left && position.x-6 <= (offset.left+offset.width) && position.y+3 >= offset.top && position.y+3 <= (offset.top+offset.height)) {
		      if($('#cursor_'+player).size() == 0) {
		        $('#cursor_'+player).show();
				if (current_layer == layer){
    		    	$('#scan_container #images').after('<div class="cursors" id="cursor_'+player+'"><div class="cursor_blob">...</div><div class="cursor_arrow"></div></div>');
    		   		$('#cursor_'+player+' .cursor_blob').css({'background-color': '#'+color, opacity: 1});
	    		    $('#cursor_'+player+' .cursor_arrow').css({'border-top-color': '#'+color, opacity: 1});
				}else{

	    		    $('#scan_container #images').after('<div class="cursors" id="cursor_'+player+'"><div class="cursor_blob">Layer: ' + (current_layer + 1) + '</div><div class="cursor_arrow"></div></div>');
	    		   	$('#cursor_'+player+' .cursor_blob').css({'background-color': '#'+color, opacity: .5});
	    		    $('#cursor_'+player+' .cursor_arrow').css({'border-top-color': '#'+color, opacity: .5});
				}
    		    $('#cursor_'+player).css({
    		      top: (position.y+3)+'px',
    		      left: (position.x-6)+'px'
    		    });
 			 } else {
    		    $('#cursor_'+player).show();
				if (current_layer == layer){
    		   		$('#cursor_'+player+' .cursor_blob').css({'background-color': '#'+color, opacity: 1});
	    		    $('#cursor_'+player+' .cursor_arrow').css({'border-top-color': '#'+color, opacity: 1});
				}else{
					//$('#cursor_'+player+' .cursor_blob').html('Layer: ' + (current_layer+1));
	    		    $('#cursor_'+player+' .cursor_blob').css({'background-color': '#'+color, opacity: .5});
	    		    $('#cursor_'+player+' .cursor_arrow').css({'border-top-color': '#'+color, opacity: .5});
				}
    		    $('#cursor_'+player).css({
    		      top: (position.y+3)+'px',
    		      left: (position.x-6)+'px'
    		    });
    		  }
		    } else {
		      $('#cursor_'+player).hide();
		    }
		  } else {
		    $('#cursor_'+player).hide();
		  }
		}
	});
};
