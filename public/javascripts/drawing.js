components.drawing = function(){
	console.log('loaded drawing');
	
	var tempImageData;
	var curTool = 0;
	// isDrawing is for one person? Doesn't make sense if there are other people drawing too!
	var isDrawing;
	var context;
	var erase; //Whether it's in erase mode
	var size = 10;
	
	window.PointView = Backbone.View.extend({
		initialize: function() {
			_.bindAll(this, 'render');
			erase = false;
			console.log(this.model);
			//this.model.view = this;
			this.canvas = $('.scanvas').dom[0];
			this.ctx = this.canvas.getContext("2d");
			//console.log(this.model);
			var actionType = this.model.get('action');
			var x = this.model.get('x');
			var y = this.model.get('y');
			var tool = this.model.get('tool');
			if(actionType==4) this.load();
			else this.render(x,y,actionType,tool);
		},
		updCanv: function() {
			tempImageData=this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
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
		load: function()  {
			var c = 0;
			var pointArray = this.model.get('pointArrayServer');
			while(c<pointArray.length){
				this.render(pointArray[c].x,
							pointArray[c].y,
							pointArray[c].actionType,
							pointArray[c].tool)
				c++;
			}
			return this;
		},
		render: function(x,y,actionType,tool) {
			this.ctx.lineWidth  = size*2;
			if (actionType==3) {
				curTool = tool;
			} else {
				erase = false;
				if (curTool == 0) {
					this.ctx.fillStyle = "rgb(0,0,255)";
					this.ctx.strokeStyle = "rgb(0,0,255)";
				} else if (curTool == 1) {
					this.ctx.fillStyle = "rgb(255,0,0)";
					this.ctx.strokeStyle = "rgb(255,0,0)";
				} else if(curTool == 2) {
					erase=true;
					this.ctx.fillStyle = "rgb(255,255,255)";
					this.ctx.strokeStyle = "rgb(255,255,255)";
				}
			}
			if(actionType == 'startLine') isDrawing = true;
			if(isDrawing && (actionType=='drawLine' || actionType=='endLine')){
				this.ctx.lineTo(x,y);
				this.ctx.closePath();
				this.ctx.stroke();
			}
			if(isDrawing){
				this.ctx.beginPath();
				this.ctx.arc(x,y, size, 0, Math.PI*2, true); 
				this.ctx.closePath();
				this.ctx.fill();
				if(actionType=='endLine') isDrawing = false;
			}
			if(actionType=='startLine' || actionType == 'drawLine'){
				this.ctx.beginPath();
			}
			if(erase) this.updCanv();
			return this;
		}
	});
	
	window.pointArray = new Array()
	
	window.ComputerView = Backbone.View.extend({
		el: $('#game'),
		events: {
			'click .light_grey_gradient_text': 'goBack',
			"mousedown .scanvas": "startLine",
			"mousemove .scanvas" : "drawLine",
			"mouseup .scanvas": "endLine",
			/*"click .brush0": "changeColor0",
			"click .brush1": "changeColor1",
			"click .brush2": "changeColor2",
			"click .brush3": "Load"*/
		},
		initialize: function() {
			_.bindAll(this, 'render');
			this.render();
			erase = false;
			//console.log(this.model);
			//this.model.view = this;
			//this.canvas = $('.scanvas').dom[0];
			//this.ctx = this.canvas.getContext("2d");
			//console.log(this.model);
			//var actionType = this.model.get('action');
			//var x = this.model.get('x');
			//var y = this.model.get('y');
			//var tool = this.model.get('tool');
			//if(actionType==4) this.load();
			//else this.render(x,y,actionType,tool);
		},
			updCanv: function() {
				tempImageData=this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
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
			load: function()  {
				var c = 0;
				var pointArray = this.model.get('pointArrayServer');
				while(c<pointArray.length){
					this.render(pointArray[c].x,
								pointArray[c].y,
								pointArray[c].actionType,
								pointArray[c].tool)
					c++;
				}
				return this;
			},
			renderCanvas: function(x,y,actionType,tool) {
				console.log("heyPotato",x,y,actionType,tool);
				console.log("heyBobby",this.ctx);
				this.ctx.lineWidth  = size*2;
				if (actionType==3) {
					curTool = tool;
				} else {
					erase = false;
					if (curTool == 0) {
						this.ctx.fillStyle = "rgb(0,0,255)";
						this.ctx.strokeStyle = "rgb(0,0,255)";
					} else if (curTool == 1) {
						this.ctx.fillStyle = "rgb(255,0,0)";
						this.ctx.strokeStyle = "rgb(255,0,0)";
					} else if(curTool == 2) {
						erase=true;
						this.ctx.fillStyle = "rgb(255,255,255)";
						this.ctx.strokeStyle = "rgb(255,255,255)";
					}
				}
				if(actionType == 'startLine') isDrawing = true;
				if(actionType=='drawLine' || actionType=='endLine'){
					this.ctx.lineTo(x,y);
					this.ctx.closePath();
					this.ctx.stroke();
					this.ctx.moveTo(x,y);
				} else if(isDrawing){
					this.ctx.beginPath();
					this.ctx.arc(x,y, size, 0, Math.PI*2, true); 
					this.ctx.closePath();
					this.ctx.fill();
					if(actionType=='endLine') isDrawing = false;
				} else if(actionType=='startLine' || actionType == 'drawLine'){
					this.ctx.beginPath();
				}
				if(erase) this.updCanv();
				console.log("Are we finishing though?");
				return this;
			},
		goBack: function(e) {
			e.preventDefault();
			delete this;
			new CaseView;
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
			this.canvas = $('canvas').dom[0];
			this.ctx = this.canvas.getContext("2d");
			_.bindAll(this, 'drawPoint');
			_.bindAll(this, 'renderCanvas');
			drawing.bind("drawP", this.drawPoint);
			
			
			
		
		
			// every time you 'add' something, it calls drawPoint
			//drawing.bind('add', this.drawPoint);
			
			em.on('pointColored', function(player_id, point) {
				//console.log(window.self);
				//console.log(point.x);
				//console.log(point.y);
				console.log(point.action);
				window.self.renderCanvas(point.x,point.y,point.action,1);
			});
			em.on('pointErased', function(player_id, point) {
				console.log(player_id, point)
			});
			
			// fixtures for the images (scans):
			var images = ['/images/cases/case1/1.png', '/images/cases/case1/2.png','/images/cases/case1/3.png', '/images/cases/case1/4.png'];
			
			images.forEach(function(img){
				if(images.indexOf(img) == images.length-1) {
					this.$('#images').append('<img src="'+img+'" />');
				} else {
					this.$('#images').append('<img src="'+img+'" style="display: none;" />');
				}
			});
			window.self = this;
			
		},
		drawPoint: function(model) {
			//_.bindAll(this, "drawPoint", function(model) {
			// create new point locally
			//var point = new PointView({model: model});
			// send the model to the server
			/*
			remote.newPoint({model: model});
			em.on('newPoint', function(point){
				drawing.create(point);
			});
			*/
		},
		startLine: function(event) {
			remote.pointColored(myUID, {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop, action:"startLine"});
		},
		drawLine: function(event) {
			remote.pointColored(myUID, {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop, action:"drawLine"});
		},
		endLine: function(event) {
			remote.pointColored(myUID, {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop, action:"endLine"});
		}
	});
};