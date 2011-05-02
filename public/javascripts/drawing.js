components.drawing = function(){
	console.log('loaded drawing');

	window.ComputerView = Backbone.View.extend({
		el: $('#game'),
		events: {
			'click #current_room_button': 'goBack',
			"mousedown .scanvas": "startLine",
			"mousemove .scanvas" : "drawLine",
			"mouseup .scanvas": "endLine",
			"mouseout .scanvas": "endLine",
			"change .slider": "changeLayer",
			"click .drawingTool": "drawTool",
			"click .erasingTool": "eraseTool",
			"click .done": "done"
		},
		initialize: function() {
			_.bindAll(this, 'render');
			this.render();
			this.locked = false;
		},
		render: function() {
			if (view.computer) {
				this.el.html('');
				this.el.html(view.computer);
				this.setupView();
			} else {
				$.get('/renders/computer.html', function(t){
					this.el.html('');
					view.computer = t;
					this.el.html(view.computer);
					this.setupView();
				}.bind(this));
			}
		},
		setupView: function() {
			new FriendBar;

			this.$('.drawingTool').attr('style', 'background:' + online_friends.get(me.id).get('player_color'));
			this.canvas = $('canvas')[0];
			this.ctx = this.canvas.getContext("2d");
			this.isErasing = false;

			em.on('pointColored', function(player_id, point) {
				if (online_friends.get(player_id).get('layer_enabled')){
					this.colorPoint(point.x, point.y, point.layer, online_friends.get(player_id).get('player_color'));
				}
			}.bind(this));
			
			em.on('pointErased', function(player_id, point) {
				
				console.log ("erased:", player_id, point);
				this.erasePoint(point.x, point.y, point.layer);
			}.bind(this));

			em.on('setColoredPointsForThisLayer', function(points){
				if(points) {
					var color = online_friends.get(points.player).get('player_color');
					for(key in points.payload) {
						this.colorPoint(points.payload[key].point.x, points.payload[key].point.y, points.payload[key].point.layer, color);
					}
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
			//remote.getColoredPointsForThisLayer(layer, emit);
			remote.getColoredPointsForThisLayerAndPlayer(me.get('current_case_id'), me.id, me.id, layer, emit);
		},
		goBack: function(e) {
			e.preventDefault();
			delete this;
			new CaseView;
		},
		colorPoint: function(x, y, slide, color) {
			if(layer == slide) {
				this.ctx.fillStyle = "#"+color;
				this.ctx.moveTo(0,0);
				this.ctx.fillRect(x,y,1,1);
			}
		},
		erasePoint: function(x, y, slide) {
			if(layer == slide) {
				var imageData=this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
				var pix = imageData.data;
				if(x>0&&y>0){
					pix[((y*(imageData.width*4)) + (x*4)) + 3]=0;
					//pix[((y*(imageData.width*4)) + (x*4)) + 3]=0;
					//pix[(((y)*(imageData.width*4)) + (x*4)) + 3]=0;
					//pix[(((y-1)*(imageData.width*4)) + ((x-1)*4)) + 3]=0;
				}
				// Draw the ImageData at the given (x,y) coordinates.
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.ctx.putImageData(imageData, 0, 0);
				/*this.ctx.fillStyle = 'rgb(255,255,255)';
				this.ctx.moveTo(0,0);
				console.log('Erase: x: '+x, 'y: '+y);
				this.ctx.fillRect(x,y,1,1);
				*/
			}
		},
		startLine: function(event) {
			event.preventDefault();
			this.isDrawing = true;
			this.oldX = event.clientX-this.canvas.offsetLeft;
			this.oldY = event.clientY-this.canvas.offsetTop;
		},
		drawLine: function(event) {
			event.preventDefault();
			if(this.isDrawing && !this.locked) {
				if(this.isErasing){
					// Joe: What does this do? Please comment stuff
					var xvar = event.clientX-this.canvas.offsetLeft;
					var yvar = event.clientY-this.canvas.offsetTop;
					//console.log('Current: x: '+xvar, 'y: '+yvar);
					var points = new Array();
					var delX = (xvar-this.oldX);
					var delY = (yvar-this.oldY);
					var arrayPos = 0;
					if(Math.abs(delX)>Math.abs(delY)) var stepCount=Math.abs(delX);
					else var stepCount = Math.abs(delY);
					for(var c = 0; c < stepCount; c++){
						var curX = Math.floor(this.oldX+(delX/stepCount)*(c+1));
						var curY = Math.floor(this.oldY+(delY/stepCount)*(c+1));
						/*for (var xSubset = curX-2; xSubset < curX+2; xSubset++)
							for (var ySubset = curY-2; ySubset < curY+2; ySubset++)
								if(xSubset>0 && xSubset<this.canvas.width && ySubset>0 && ySubset<this.canvas.height){
									points[arrayPos] = {x: xSubset,
										y: ySubset,
										layer: layer};
									arrayPos++;
								}
						*/
						points[c] = {x: 1*(Math.floor(this.oldX+(delX/stepCount)*(c))),
							y: 1*(Math.floor(this.oldY+(delY/stepCount)*(c))),
							layer: layer};
					}
					//points[0] = {x: xvar, y: yvar, layer: layer};
					this.oldX = xvar;
					this.oldY = yvar;
					remote.pointErased(myUID, points);
				}else{
					var xvar = event.clientX-this.canvas.offsetLeft;
					var yvar = event.clientY-this.canvas.offsetTop;
					var points = new Array();
					var delX = (xvar-this.oldX);
					var delY = (yvar-this.oldY);
					if(Math.abs(delX)>Math.abs(delY)) var stepCount=Math.abs(delX);
					else var stepCount = Math.abs(delY);
					for(var c = 0; c < stepCount; c++){
						points[c] = {x: Math.floor(this.oldX+(delX/stepCount)*(c)),
							y: Math.floor(this.oldY+(delY/stepCount)*(c)),
							layer: layer};
						//console.log("input: ",points[c]);
					}
					this.oldX = xvar;
					this.oldY = yvar;
					remote.pointColored(myUID, points);
				
				}
				/* -- Greg: What does this do? Please comment stuff
					for (var xvar = event.clientX-this.canvas.offsetLeft-2; xvar < event.clientX-this.canvas.offsetLeft+2; xvar++)
						for (var yvar = event.clientY-this.canvas.offsetTop-2; yvar < event.clientY-this.canvas.offsetTop+2; yvar++)
							if(xvar>0 && xvar<this.canvas.width && yvar>0 && yvar<this.canvas.height)
								remote.pointErased(me.get('current_case_id'), me.id, {x: xvar, y: yvar, layer: layer});
				}else remote.pointColored(me.get('current_case_id'), me.id, {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop, layer: layer});
				*/
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

				//remote.getColoredPointsForThisLayer(layer, emit);

				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

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
		getColorPointsForLayerAndPlayer: function(showAll) {
			if(showAll) {
				this.locked = !this.locked;
				if(this.locked) {
					$('.done').text('UNLOCK');
					online_friends.each(function(friend){
						if (!friend.get('layer_enabled')){
							friend.toggleVisibility();
						}
					});
				} else {
					$('.done').text("I'M DONE");
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