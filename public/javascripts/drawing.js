components.drawing = function(){
	console.log('loaded drawing');
	window.invitation = {};
	window.ComputerView = Backbone.View.extend({
		el: $('#game'),
		events: {
			'click #back_to_cases': 'goBack',
			'click #current_case_info_open': 'expandInfo', //added to allow current case info roll down
			'click #current_case_info_close': 'retractInfo', //added to allow current case info roll up
			'click #expand_collapse_button':'chatExpandRetract',
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
			'click #undoTool': 'undoTool',
			'click #send_chat':'sendChat',
			'click #zoomTool': 'zoomTool',
			'keyup #type':'sendChat',
			"click #done": "done",
			"click #accept_invite":"pagerAcceptInvite",
			"click #decline_invite":"pagerDeclineInvite",
			"click #invite":"invite",
			"click #dont_invite":"dontInvite",
			'click #cursorTool':'cursorTool',
			'mousemove': 'cursorMovement'
		},
		initialize: function() {
			window.dThis=this;
			_.bindAll(this, 'render');
			this.render();
			this.locked = false;
			this.chatExpanded = false;
			this.scale=1;
			online_friends.bind('change', this.collectionChanged);
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

			this.$('#current_info_container').hide();
			this.$('.drawingTool').attr('style', 'background:' + online_friends.get(me.id).get('player_color'));
			this.canvasArr = {};
			this.ctxArr = {};
			this.index = 0;
			var self = this;
			online_friends.each(function(item){
				var playerID = item.get('id');
				//document.getElementById('scan').innerHTML += '<canvas class="scanvas" id="scanvas" height="325" width="431" style="position: absolute; top:'+(1*(self.index*100+50))+';left:250; z-index: 5"></canvas>';
				self.canvasArr[playerID] = ($('canvas')[9-self.index]);
				self.ctxArr[playerID] = self.canvasArr[playerID].getContext("2d");
				self.index++;
			});
			this.canvas = $('canvas')[10];
			this.ctx = this.canvas.getContext("2d");
			this.isErasing = false;
			
			/* Retreive chat messages */
			remote.getChatHistoryForActivity(me.get('current_case_id'), emit);
			
			
			/*********************************************
			*               Event listeners              *
			**********************************************/
			
			em.on('pointColored', function(player_id, points) {
				if (online_friends.get(player_id).get('layer_enabled')){
					this.colorPoint(points, online_friends.get(player_id).get('player_color'), this.ctxArr[player_id]);	
				}
			}.bind(this));
			em.on('pointErased', function(player_id, points) {
				this.erasePoint(points,this.ctxArr[player_id]);
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
			em.on('JoinRequest', function(caseNumber, player_id, player_name, player_avatar) {
				invitation['case_id'] = caseNumber;
				invitation['player_id'] = player_id;
				invitation['player_name'] = player_name;
				invitation['player_avitar'] = player_avatar;
				$('.pager_facebook_image').attr('style', 'background: url(\'' + player_avatar + '?type=normal\') no-repeat;');
				$('#invitation_text').html('<h3>' + player_name + ' requests your opinion.</h3>');
			});
			
			// event listener for chat
			em.on('setChatHistory', this.setChatHistory);
			em.on('newChat', this.receiveChat);
			
			/*********************************************/
			
			// fixtures for the images (scans):
			var imageRefs = ['/images/cases/case1/1.png', '/images/cases/case1/2.png','/images/cases/case1/3.png', '/images/cases/case1/4.png'];
			this.$('#slider_input').attr('style', 'width:' + ((imageRefs.length - 1) * 40));
			
			
			var counter = 0;
			imageRefs.forEach(function(img){
				var distance = (counter * 40);
				var tickTemplate = '<div class="tick" style="padding-left:' + distance + 'px;">|</div>';
				this.$('#images').append('<img src="'+img+'" style="display: none;" />');
				this.$('#tick_holder').append(tickTemplate);
				counter++;
			});

			layers = this.$('#images').children();
			$(layers[0]).show();
			// refactor to put images/slides/layers ?? into models/collections with attribute active: true
			window.layer = 0;
			remote.getColoredPointsForThisLayerAndPlayer(me.get('current_case_id'), me.id, me.id, layer, emit);
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
		goBack: function(e) {
			e.preventDefault();
			delete this;
			new CaseView;
		},
		colorPoint: function(points, color, context) {
			var imageData=context.getImageData(0, 0, this.canvas.width, this.canvas.height);
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
						pix[((y*(imageData.width*4)) + (x*4)) + 0]=redVal;
						pix[((y*(imageData.width*4)) + (x*4)) + 1]=greenVal;
						pix[((y*(imageData.width*4)) + (x*4)) + 2]=blueVal;
						pix[((y*(imageData.width*4)) + (x*4)) + 3]=255;
						
						
					}
				}
			}
			context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			context.putImageData(imageData, 0, 0);
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
		zoomTool: function(event) {
			event.preventDefault();
			
			
			//Needs to be done manually *scale* doesn't work as intended
			for(ctxKey in this.ctxArr){
				//var mousex = event.clientX - this.canvas.offsetLeft;
				//var mousey = event.clientY - this.canvas.offsetTop;
				
				//var zoom = .5;

				 //this.ctxArr[key].translate(0,0);
				//var imageData=this.ctxArr[key].getImageData(0, 0, this.canvas.width, this.canvas.height);
				this.ctxArr[ctxKey].scale(2.0,2.0);
				
				
				//this.ctxArr[key].putImageData(imageData, 0, 0);
				
			}
			//Redraw it scaled
			this.scale = 2;
			    
		},
		erasePoint: function(points,context) {
			var imageData=context.getImageData(0, 0, this.canvas.width, this.canvas.height);
			var pix = imageData.data;
			for(var c = 0; c < points.length; c++){
				var point = points[c];
				var x = point.x;
				var y = point.y; 
				var slide = point.layer;
				if(layer == slide) {
					
					if(x>0&&y>0){
						pix[((y*(imageData.width*4)) + (x*4)) + 3]=0;
					}
					// Draw the ImageData at the given (x,y) coordinates.
					/*this.ctx.fillStyle = 'rgb(255,255,255)';
					this.ctx.moveTo(0,0);
					console.log('Erase: x: '+x, 'y: '+y);
					this.ctx.fillRect(x,y,1,1);
					*/
				}
			}
			context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			context.putImageData(imageData, 0, 0);
			
		},
		startLine: function(event) {
			event.preventDefault();
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
					for(var c = 0; c < stepCount; c++){
						var curX = Math.floor(this.oldX+(delX/stepCount)*(c+1));
						var curY = Math.floor(this.oldY+(delY/stepCount)*(c+1));
						if(isVertical){
							for (var ySubset = curY-2; ySubset < curY+2; ySubset++)
								if(ySubset>0 && ySubset<this.canvas.height){
									points[arrayPos] = {x: curX,
										y: ySubset,
										layer: layer};
									arrayPos++;
								}
						}else{
							for (var xSubset = curX-2; xSubset < curX+2; xSubset++)
								if(xSubset>0 && xSubset<this.canvas.width){
									points[arrayPos] = {x: xSubset,
										y: curY,
										layer: layer};
									arrayPos++;
								}
						}
					}
					this.oldX = xvar;
					this.oldY = yvar;
					
					remote.pointErased(me.get('current_case_id'), me.id, points);
					this.erasePoint(points,this.ctxArr[me.id]);
					
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
					for(var c = 0; c < stepCount; c++){
						var curX = Math.floor(this.oldX+(delX/stepCount)*(c+1));
						var curY = Math.floor(this.oldY+(delY/stepCount)*(c+1));
						var penWidth = 1;
						if(isVertical){
							for (var ySubset = curY-Math.floor(penWidth/2); ySubset < curY+penWidth-Math.floor(penWidth/2); ySubset++)
								if(ySubset>0 && ySubset<this.canvas.height){
									points[arrayPos] = {x: curX,
										y: ySubset,
										layer: layer};
									arrayPos++;
								}
						}else{
							for (var xSubset = curX-Math.floor(penWidth/2); xSubset < curX+penWidth-Math.floor(penWidth/2); xSubset++)
								if(xSubset>0 && xSubset<this.canvas.width){
									points[arrayPos] = {x: xSubset,
										y: curY,
										layer: layer};
									arrayPos++;
								}
						}
					}
					this.oldX = xvar;
					this.oldY = yvar;
					
					//this.drawLocally(points);
					remote.pointColored(me.get('current_case_id'), me.id, points);
					this.colorPoint(points, me.get('player_color'), this.ctxArr[me.id]);	
				
					
				}
			}
		},
		drawTool: function(event) {
			event.preventDefault();
			this.isErasing = false;
			this.$('.drawingTool').attr('style', 'background:' + online_friends.get(me.id).get('player_color'));
			this.$('.erasingTool').attr('style', 'background: #FFFFFF');
		},
		eraseTool: function(event) {
			event.preventDefault();
			this.isErasing = true;
			this.$('.erasingTool').attr('style', 'background:' + online_friends.get(me.id).get('player_color'));
			this.$('.drawingTool').attr('style', 'background: #FFFFFF');
		},
		endLine: function(event) {
			event.preventDefault();
			this.isDrawing = false;
		},
		changeLayer: function(event) {
			if($('.slider')[0].value != layer){
				layer = $('.slider')[0].value;
				for(ctxKey in this.ctxArr){
					//var imageData=this.ctxArr[ctxKey].getImageData(0, 0, this.canvas.width, this.canvas.height);
					this.ctxArr[ctxKey].clearRect(0, 0, this.canvas.width, this.canvas.height);
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
		done: function(event) {
			event.preventDefault();
			remote.done(me.id);
			this.getColorPointsForLayerAndPlayer(true);
		},
		expandInfo: function (e) { //added to allow current case info roll down
			e.preventDefault();
			this.$('#current_info_container').show();
		},
		retractInfo: function (e) { //added to allow current case info roll up
			e.preventDefault();
			this.$('#current_info_container').hide();
		},
		undoTool: function (e) { //added to allow undo functions
			e.preventDefault();
			//TODO - Allow for Undo
		},
		inviteFriends: function (e){ // added to allow invitation of friends
			e.preventDefault();
		},
		hideDrawing: function (e){ //added to allow hiding of all drawings 
			e.preventDefault();
		},
		resetDrawing: function (e){ //added to allow reset of entire drawing (clear all my points)
			e.preventDefault();
			
				var points = new Array();
				var arrayPos = 0;
				for(var x = 0; x < this.canvas.width; x++)
					for(var y = 0; y < this.canvas.height; y++){
							points[arrayPos] = {x: x,
									y: y,
									layer: layer};
									arrayPos++;
						
				}
					this.erasePoint(points,this.ctxArr[me.id]);
				//remote.pointErased(me.get('current_case_id'), me.id, points);
			
			
			
		},
		teamTab: function (e){ // added to allow team tab clicking
			e.preventDefault();
			currentView = 0;
			friendbar = new FriendBar();
			this.$('#team_tab').attr('style','background: url(../images/tab_bg_active.png) repeat-x');
			this.$('#online_tab').attr('style','background: url(../images/tab_bg.png) repeat-x');
		},
		onlineTab: function (e){ //added to allow online tab clicking
			e.preventDefault();
			currentView = 1;
			friendbar = new FriendBar();
			this.$('#team_tab').attr('style','background: url(../images/tab_bg.png) repeat-x');
			this.$('#online_tab').attr('style','background: url(../images/tab_bg_active.png) repeat-x');
		},
		sendChat: function (e){
			e.preventDefault();
			var inputEl = this.$('#type')[0];
			var chatEl = this.$('#chat_window')[0];
			var message = inputEl.value;
			if(e.type == "click" || e.keyCode == 13 && message != '') {
				$(chatEl).append('<div class="chat_msg_con"><span class="chat_person" style="color: #'+me.get('player_color')+'; font-weight: bold;">me:</span><span class="chat_message"> '+message+'</span></div>');
				inputEl.value = '';
				chatEl.scrollTop = chatEl.scrollHeight;
				remote.sendChat(me.get('current_case_id'), me.id, message);
			}
		},
		receiveChat: function(player_id, message) {
		    // should be fixed serverside - publish to other clients!
		    if(player_id != me.get('id')) {
		        var player = online_friends.filter(function(chatFriend) { return chatFriend.get('id') === player_id });
		        $('#chat_window').append('<div class="chat_msg_con"><span class="chat_person" style="color: #'+player[0].get('player_color')+'; font-weight: bold;">me:</span><span class="chat_message"> '+message+'</span></div>');
		   }
		},
		setChatHistory: function(data) {
	        _.each(data.payload, function(message) {
	            var player = online_friends.filter(function(chatFriend) { return chatFriend.get('id') === player });
	            $('#chat_window').append('<div class="chat_msg_con"><span class="chat_person" style="color: #'+player[0].get('player_color')+'; font-weight: bold;">'+player[0].get('name')+':</span><span class="chat_message"> '+message+'</span></div>');
	        });
		},
		showPager: function (b){
			if(b){
				this.$(".pager").show();
			}else{	
				this.$(".pager").hide();
			}
		}	,	
		pagerAcceptInvite: function (e){
			e.preventDefault();
			console.log ('received case id ' + invitation['case_id']);
			remote.joinActivity(invitation['case_id'], me);
			me.set({current_case_id: invitation['case_id']});
			online_friends.each(function (friend){
				if (friend.get('id') == me.get('id')){
					friend.set({current_case_id: invitation['case_id']});
					console.log ('changed friend case id');
				}
			});
			new ComputerView;
		},
		pagerDeclineInvite: function (e){
			e.preventDefault();
			showPager (false);
		},
		chatExpandRetract: function (e){
			e.preventDefault();
			this.chatExpanded = !this.chatExpanded;
			if(this.chatExpanded){
				this.$('#chat_container').attr('style', 'margin: 100px 0px 0px 0px');
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
				this.locked = !this.locked;
				if(this.locked) {
					$('#done_text').text('UNLOCK');
					online_friends.each(function(friend){
						if (!friend.get('layer_enabled')){
							friend.toggleVisibility();
							remote.getColoredPointsForThisLayerAndPlayer(me.get('current_case_id'), me.id, friend.get('id'), layer, emit);
						}
					});
				} else {
					$('#done_text').text("I'M DONE");
				}
			} else {
				online_friends.each(function(friend){
					if (friend.get('layer_enabled')){
						remote.getColoredPointsForThisLayerAndPlayer(me.get('current_case_id'), me.id, friend.get('id'), layer, emit);
					}
				});
			}
		},
		cursorTool: function(e) {
		    e.preventDefault();
		},
		cursorMovement: function(e) {
		    _.throttle(this.sendCursorPosition, 50);
		},
		sendCursorPosition: function() {
		    console.log('yay');
		}
	});
};