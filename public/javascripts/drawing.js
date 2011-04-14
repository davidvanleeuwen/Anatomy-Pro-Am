components.drawing = function(){
	console.log('loaded drawing');
	
	window.ComputerView = Backbone.View.extend({
		el: $('#game'),
		events: {
			'click .light_grey_gradient_text': 'goBack',
			"mousedown .scanvas": "startLine",
			"mousemove .scanvas" : "drawLine",
			"mouseup .scanvas": "endLine",
			"change .slider": "changeLayer",
			"click .color": "toggleErase",
			"click .erase": "toggleErase"
		},
		initialize: function() {
			_.bindAll(this, 'render');
			this.render();
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
			this.canvas = $('canvas')[0];
			this.ctx = this.canvas.getContext("2d");
			this.isErasing = false;
			
			// queue per user for drawing points, we might want to refactor this and add this info to the user model?
			this.users = {};
			
			em.on('pointColered', function(player_id, point) {
				var user = this.users[player_id];
				
				if(!user) {
					user = this.users[player_id] = {};
				}
				
				if(user.x != 0 && user.y != 0) {
					this.colorPoint(point.x, point.y, point.layer);
				}
				
			}.bind(this));
			
			em.on('pointErased', function(player_id, point) {
				var user = this.users[player_id];
				
				if(!user) {
					user = this.users[player_id] = {};
				}
				
				if(user.x != 0 && user.y != 0) {
					this.erasePoint(point.x, point.y, point.layer);
				}
				
			}.bind(this));
		
			
			var self = this;
			
			em.on('setColoredPointsForThisLayer', function(points){
				for(player in points) {
					for(point in points[player]) {
						self.colorPoint(points[player][point].x, points[player][point].y, points[player][point].layer);
					}
				}
			});
			
			// fixtures for the images (scans):
			var imageRefs = ['/images/cases/case1/1.png', '/images/cases/case1/2.png','/images/cases/case1/3.png', '/images/cases/case1/4.png'];
			
			imageRefs.forEach(function(img){
				this.$('#images').append('<img src="'+img+'" style="display: none;" />');
			});
			
			this.slides = this.$('#images').children();
			
			$(this.slides[0]).show();
			this.slide = 0;
			remote.getColoredPointsForThisLayer(this.slide, emit);
		},
		goBack: function(e) {
			e.preventDefault();
			delete this;
			new CaseView;
		},
		colorPoint: function(x, y, slide) {
			if(this.slide == slide) {
				this.ctx.fillStyle = "rgb(255,0,0)";
				this.ctx.beginPath();
				this.ctx.arc(x,y,1,0,Math.PI*2,true);
				this.ctx.closePath();
				this.ctx.fill();
			}
		},
		erasePoint: function(x, y, slide) {
			if(this.slide == slide) {
				this.ctx.fillStyle = "rgb(255,255,255)";
				this.ctx.beginPath();
				this.ctx.arc(x,y,1,0,Math.PI*2,true);
				this.ctx.closePath();
				this.ctx.fill();
				var tempImageData=this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
				var pix = tempImageData.data;
				for (var i = 0, n = pix.length; i < n; i += 4) 
				    if(pix[i]>0&&pix[i+1]>0&&pix[i+2]>0) pix[i+3]=0;
				// Draw the ImageData at the given (x,y) coordinates.
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.ctx.putImageData(tempImageData, 0, 0);
		}
		},
		startLine: function(event) {
			event.preventDefault();
			this.isDrawing = true;
		},
		drawLine: function(event) {
			event.preventDefault();
			if(this.isDrawing) {
				if(this.isErasing){
					for (var xvar = event.clientX-this.canvas.offsetLeft-2; xvar < event.clientX-this.canvas.offsetLeft+2; xvar++)
						for (var yvar = event.clientY-this.canvas.offsetTop-2; yvar < event.clientY-this.canvas.offsetTop+2; yvar++)
							if(xvar>0 && xvar<this.canvas.width && yvar>0 && yvar<this.canvas.height)
								remote.pointErased(myUID, {x: xvar, y: yvar, layer: this.slide});
				}else remote.pointColored(myUID, {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop, layer: this.slide});
			}
		},
		drawTool: function(event) {
			event.preventDefault();
			this.isErasing = false;
		},
		eraseTool: function(event) {
			event.preventDefault();
			this.isErasing = true;
		},
		endLine: function(event) {
			event.preventDefault();
			this.isDrawing = false;
		},
		changeLayer: function(event) {
			if($('.slider')[0].value != this.slide){
				this.slide = $('.slider')[0].value;
			
				remote.getColoredPointsForThisLayer(this.slide, emit);
			
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			
				var slide = this.slide;
				this.slides.each(function(n, el){
					if(slide != n) {
						$(el).hide();
					} else {
						$(el).show();
						$('#slide').html('#'+(n+1));
					}
				});
			}
		},
		toggleErase: function(event) {
			event.preventDefault();
			this.isErasing = true;
		}
	});
};