components.drawing = function(){
	console.log('loaded drawing');

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
			"click #done": "done"
		},
		initialize: function() {
			_.bindAll(this, 'render');
			this.render();
			this.locked = false;
			this.chatExpanded = false;
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
			new FriendBar;

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

			// fixtures for the images (scans):
			var imageRefs = ['/images/cases/case1/1.png', '/images/cases/case1/2.png','/images/cases/case1/3.png', '/images/cases/case1/4.png',
							'/images/cases/case2/0.png','/images/cases/case2/1.png', '/images/cases/case2/2.png','/images/cases/case2/3.png', '/images/cases/case2/4.png'];

			imageRefs.forEach(function(img){
				this.$('#images').append('<img src="'+img+'" style="display: none;" />');
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
		colorPoint: function(points, color,context) {
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
					
					remote.pointColored(me.get('current_case_id'), me.id, points);
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
					var imageData=this.ctxArr[ctxKey].getImageData(0, 0, this.canvas.width, this.canvas.height);
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
		},
		teamTab: function (e){ // added to allow team tab clicking
			e.preventDefault();
		},
		onlineTab: function (e){ //added to allow online tab clicking
			e.preventDefault();
		},
		sendChat: function (e){ //added to control send-chat functions
			e.preventDefault();
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
		}
	});
};