components.drawing = function(){
	console.log('loaded drawing');
	
	window.ComputerView = Backbone.View.extend({
		el: $('#game'),
		events: {
			'click .light_grey_gradient_text': 'goBack',
			"mousedown .scanvas": "startLine",
			"mousemove .scanvas" : "drawLine",
			"mouseup .scanvas": "endLine",
			"mousedown .brush2" : "eraseTool",
			"mousedown .brush0" : "drawTool",
			"change .slider": "changeLayer"
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
			
			// queue per user for drawing points, we might want to refactor this and add this info to the user model?
			this.users = {};
			
			em.on('pointColered', function(player_id, point) {
				var user = this.users[player_id];
				
				if(!user) {
					user = this.users[player_id] = {};
				}
				
				if(user.x != 0 && user.y != 0) {
					this.colorPoint(point.x, point.y, point.slide, point.tool);
				}
				
			}.bind(this));
			
			em.on('pointErased', function(player_id, point) {
				console.log(player_id, point)
			});
			
			// fixtures for the images (scans):
			var imageRefs = ['/images/cases/case1/1.png', '/images/cases/case1/2.png','/images/cases/case1/3.png', '/images/cases/case1/4.png'];
			
			imageRefs.forEach(function(img){
				this.$('#images').append('<img src="'+img+'" style="dislay: none;" />');
			});
			
			this.slides = this.$('#images').children();
			$(this.slides[0]).show();
			this.slide = 0;
		},
		goBack: function(e) {
			e.preventDefault();
			delete this;
			new CaseView;
		},
		colorPoint: function(x, y, slide, tool) {
			if(this.slide == slide) {
				if(tool == "erase") this.ctx.fillStyle = "rgb(255,255,255)";
				else this.ctx.fillStyle = "rgb(255,0,0)";
				this.ctx.beginPath();
				if(tool == "erase") this.ctx.arc(x,y,5,0,Math.PI*2,true);
				else this.ctx.arc(x,y,1,0,Math.PI*2,true);
				this.ctx.closePath();
				this.ctx.fill();
				if(tool == "erase") this.updCanv();
			}
		},
		updCanv: function() {
			var tempImageData=this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
			var pix = tempImageData.data;
			for (var i = 0, n = pix.length; i < n; i += 4) {
			    if(pix[i]>0&&pix[i+1]>0&&pix[i+2]>0){
			    	pix[i+3]=0;
			    }
			    pix[i  ] = pix[i  ]; // red
			    pix[i+1] = pix[i+1]; // green
			    pix[i+2] = pix[i+2]; // blue
			    // i+3 is alpha (the fourth element)
			}
			// Draw the ImageData at the given (x,y) coordinates.
			this.canvas.width = this.canvas.width; //Purges canvas
			this.ctx.fillStyle = "rgba(0, 0, 0, 0.0)";
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.putImageData(tempImageData, 0, 0);
		},
		startLine: function(event) {
			event.preventDefault();
			this.isDrawing = true;
		},
		drawLine: function(event) {
			event.preventDefault();
			if(this.isDrawing) {
				if(this.isErasing) remote.pointColored(myUID, {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop, slide: this.slide, tool: "erase"});
				else remote.pointColored(myUID, {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop, slide: this.slide, tool: "draw"});
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
			this.slide = $('.slider')[0].value;
			
			remote.getColoredPointsForThisLayer(this.slide, emit);
			em.on('setColoredPointsForThisLayer', function(points){
				console.log(points);
			});
			
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
	});
};