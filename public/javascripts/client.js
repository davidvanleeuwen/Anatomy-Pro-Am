/*

/*$(function(){
	var drawT = Backbone.Model.extend({
	  		initialize: function() { 
				//alert("hey");
				mouse : "true";
				history : new Array();
				curPos : 0;
				pushDis : 20;
				erase : false; 
				}
	});
	
	var timgd;
	var history = new Array();
	var curPos = 0;
	var curTool = 2;
	var isDrawing;
	var canvas;
	var context;
	var erase;
	

	var drawView = Backbone.View.extend({
		el: $('body'),
		events: {
			"mousedown .game": "startLine",
			"mousemove .game" : "drawLine",
			"mouseup .game": "endLine",
			"mousedown .brush" : "changeColor"
		},    	
		initialize: function() {
			console.log('yay');
			this.model = new drawT();
			canvas = $('.game').dom[0];
			context = canvas.getContext("2d");
			timgd = context.getImageData(0,0,canvas.width,canvas.height);
			history = this.model.get("history");
			context.fillStyle = "rgba(0, 0, 0, 0.0)";
			context.fillRect(0, 0, canvas.width, canvas.height);
			canvas.width = canvas.width;
			context.fillStyle = "rgba(0, 0, 0, 0.0)";
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.putImageData(timgd, 0, 0);
			
			erase = false;
			if(!history){
				history = new Array();
				history[0]= -1;
				history[1]= 2;
			}else{
				//Get caught up history
				
			}
			
		},
		changeColor:function(){
			curTool = 1+(curTool%3);
			history[curPos] = -1;
			history[curPos] =  curTool;
			this.model.set({history:history});
			curPos+=2;
		},
		startLine: function(event) {
			isDrawing = true;
			var xv = event.clientX-canvas.offsetLeft;
			var yv = event.clientY-canvas.offsetTop;
			if(curTool==1) context.fillStyle= "rgba(0,0,255,1)";	
			else if(curTool==2) context.fillStyle= "rgba(255,0,0,1)";	
			else if(curTool==3){
				var timgd = context.getImageData(0, 0, canvas.width, canvas.height);
				var pix = timgd.data;
				erase = false;
				var curI = 4*(xv+canvas.width*yv);
				//context.fillStyle= "rgba(255,255,255,1)";
				
				if(pix[curI+3]==0){
					context.fillStyle= "rgba(255,255,255,1)";
					erase = true;
					console.log("Is here");
				}else{
					context.fillStyle= "rgba("+pix[curI]+","+pix[curI+1]+","+pix[curI+2]+","+pix[curI+3]+")";
					console.log("not here");
				}
				
			}
			this.drawLine(event);
		},
		endLine: function(event) {
			isDrawing = false;
			context.putImageData(timgd, 0, 0);
			this.updCanv();	
		},
		drawLine: function(event) {
			if(isDrawing) {
				var xv = event.clientX-canvas.offsetLeft;
				var yv = event.clientY-canvas.offsetTop;
				history[curPos] = xv;
				history[curPos+1] = yv;
				this.model.set({history:history});
				curPos+=2;
				//Load
				context.putImageData(timgd, 0, 0);
				context.beginPath();
				context.arc(xv,yv,20,0,Math.PI*2,true);
				context.closePath();
				context.fill();
				var tmp = context.fillStyle;
				//if(erase) this.updCanv();
				//Save
				timgd=context.getImageData(0, 0, canvas.width, canvas.height)
				context.lineWidth = 1;
				context.strokeStyle = (0,0,0,1);
				context.beginPath();
				context.arc(xv,yv,20,0,Math.PI*2,true);
				context.closePath();
				context.stroke();
				
			}
		},
		updCanv: function(){
				//Joe's awesome algorithm
				//console.log("trouble?");
				var pix = timgd.data;
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
				console.log(curTool);
				
				timgd=context.getImageData(0, 0, canvas.width, canvas.height);
				
				canvas.width = canvas.width;
				context.fillStyle = "rgba(0, 0, 0, 0.0)";
				context.fillRect(0, 0, canvas.width, canvas.height);
				context.putImageData(timgd, 0, 0);
				
				console.log("trouble?3");
				
			}
	});

	window.myView = new drawView;
});




/* Just global variables







$(function(){
	var drawT = Backbone.Model.extend({
	  		initialize: function() { 
				//alert("hey");
				mouse : "true";
				history : new Array();
				curPos : 0;
				pushDis : 20;
				erase : false; 
				
				
				}
	});
	
	var canvas;
	var context;
	var imgd;
	var history;
	var erase;
	var isDrawing;
	var curPos;

	var drawView = Backbone.View.extend({
		el: $('body'),
		events: {
			"mousedown .game": "startLine",
			"mousemove .game" : "drawLine",
			"mouseup .game": "endLine"
		},    	
		initialize: function() {
			console.log('yay');
			//this.model = new drawT();
			var tcanvas = $('.game').dom[0];
			var tcontext = tcanvas.getContext("2d");
			//this.model.set({canvas:tcanvas});
			canvas = tcanvas;
			context = tcontext;
			//this.model.set({context:tcontext});
			var timgd = tcontext.getImageData(0,0,tcanvas.width,tcanvas.height);
			//this.model.set({imgd:timgd});
			imgd = timgd;
		},
		startLine: function(event) {
			console.log("Whatever");
			thistory = new Array();
			var tcurPos=1;
			//var tcanvas = this.model.get("canvas");
			var tcanvas = canvas;
			var tcontext = context;
			
			//var tcontext = this.model.get("context");
			var xv = tcanvas.offsetLeft;
			var yv = tcanvas.offsetTop;
			//thistory[0]= this.element.down("#tool").value;
			//thistory[1]=this.element.down("#cSize").value;
			thistory[0]= 2;
			thistory[1]= 10;
			
			
			thistory[tcurPos*2]=xv;
			thistory[tcurPos*2+1]=yv;
			tcurPos++;
			isDrawing = true;
			//this.model.set({isDrawing:true});
			history = thistory;
			//this.model.set({history:thistory});
			//this.model.set({curPos:tcurPos});
		
			curPos = tcurPos;
		
			if(thistory[0]==1) tcontext.fillStyle= "rgba(0,0,255,1)";	
			else if(thistory[0]==2) tcontext.fillStyle= "rgba(255,0,0,1)";	
			else if(thistory[0]==3){
				var timgd = tcontext.getImageData(0, 0, tcanvas.width, tcanvas.height);
				var pix = timgd.data;
				//this.model.set({erase:false});
				erase = false;
				var curI = 4*(xv+tcanvas.width*yv);
				if(pix[curI+3]==0){
					tcontext.fillStyle= "rgba(255,255,255,1)";
					//this.model.set({erase:true});
					erase = true;
				}else tcontext.fillStyle= "rgba("+pix[curI]+","+pix[curI+1]+","+pix[curI+2]+","+pix[curI+3]+")";
			}
			canvas = tcanvas;
			//this.model.set({canvas:tcanvas});
			context = tcontext;
			//this.model.set({context:tcontext});
		},
		endLine: function(event) {
			//this.model.set({isDrawing:false});
			isDrawing = false;
			//var tcontext = this.model.get("context");
			var tcontext = context
			//var timgd = this.model.get("imgd");
			var timgd = imgd;
			tcontext.putImageData(timgd, 0, 0);
			context = tcontext;
			//this.model.set({context:tcontext});
			this.updCanv();	
			//console.log("does finish");
			
		},
		drawLine: function(event) {
			if(isDrawing) {
			
			//if(this.model.get("isDrawing")) {
				var tcanvas = canvas;
				var tcontext = context;
				var thistory = history;
				//tcanvas = this.model.get("canvas");
				//tcontext = this.model.get("context");
				//thistory = this.model.get("history");
				var xv = event.clientX-tcanvas.offsetLeft;
				var yv = event.clientY-tcanvas.offsetTop;
				//var tcurPos = this.model.get("curPos");
				var tcurPos = curPos;
				thistory[tcurPos*2]=xv;
				thistory[tcurPos*2+1]=yv;
				tcurPos++;
				curPos=tcurPos;
				//this.model.set({curPos:tcurPos});
				//Load
				//var timgd = this.model.get("imgd");
				var timgd = imgd;
				tcontext.putImageData(timgd, 0, 0);
				tcontext.beginPath();
				tcontext.arc(xv,yv,thistory[1],0,Math.PI*2,true);
				tcontext.closePath();
				tcontext.fill();
				//this.socket.send(JSON.stringify({lineTo: {slide: this.slider.value, x: xv, y: yv}}));
				//var tmp = tcontext.fillStyle;
				//this.model.set({canvas:tcanvas});
				//this.model.set({context:tcontext});
				canvas = tcanvas;
				context = tcontext;
				
				//if(this.model.get("erase")) this.updCanv();
				
				if(erase) this.updCanv();
				//Save
				timgd=tcontext.getImageData(0, 0, tcanvas.width, tcanvas.height)
				imgd = timgd
				//this.model.set({imgd:timgd});
				tcontext.lineWidth = 1;
				tcontext.beginPath();
				tcontext.arc(xv,yv,history[1],0,Math.PI*2,true);
				tcontext.closePath();
				tcontext.stroke();
				//tcontext.fillStyle = tmp;
				//this.model.set({erase:false});
				
				canvas = tcanvas;
				context = tcontext;
				history = thistory;
				
				
				//this.model.set({canvas:tcanvas});
				//this.model.set({context:tcontext});
				//this.model.set({history:thistory});
				//console.log("does finish");
			}
			},
			updCanv: function(){
						//Joe's awesome algorithm
					//var tcontext = this.model.get("context");
					//var tcanvas = this.model.get("canvas");
					var tcontext = context;
					var tcanvas = canvas;
					var timgd = tcontext.getImageData(0, 0, tcanvas.width, tcanvas.height);
					var pix = timgd.data;
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
					tcanvas.width = tcanvas.width;
					canvas = tcanvas;
					//this.model.set({canvas:tcanvas});
					tcontext.fillStyle = "rgba(0, 0, 0, 0.0)";
					tcontext.fillRect(0, 0, tcanvas.width, tcanvas.height);
					tcontext.putImageData(timgd, 0, 0);
					context = tcontext;
					//this.model.set({context:tcontext});
					
			}
	});

	window.myView = new drawView;
});



	
*/


















//}}})))}}} BREAK ZONE






	
/*	
		
		

		}

drawT.bind('change:mouse', function(model,mouse) {
  alert("Triggered " + mouse);
});






drawT.set({mouse:'false'});






		updCanv: function(){
		//Joe's awesome algorithm
		var tcontext = this.get("context");
		var tcanvas = this.get("canvas");
		var imgd = ttcontext.getImageData(0, 0, tcanvas.width, tcanvas.height);
		var pix = imgd.data;
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
		tcanvas.width = this.canvas.width;
		this.set({canvas:tcanvas});
		tcontext.fillStyle = "rgba(0, 0, 0, 0.0)";
		tcontext.fillRect(0, 0, this.canvas.width, this.canvas.height);
		tcontext.putImageData(imgd, 0, 0);
		this.set({context:tcontext});
		},events: {
		'mo .game':  'startLine',
		},

	endLine: function(event) {
		this.isDrawing = false;
		this.context.putImageData(timgd, 0, 0);
		this.updCanv();	
	},
	drawLine: function(event) {
		if(this.isDrawing) {
			var xv = event.clientX-this.canvas.offsetLeft;
			var yv = event.clientY-this.canvas.offsetTop;
			history[curPos*2]=xv;
			history[curPos*2+1]=yv;
			curPos++;
			//Load
			this.context.putImageData(timgd, 0, 0);
			this.context.beginPath();
			this.context.arc(xv,yv,history[1],0,Math.PI*2,true);
			this.context.closePath();
			this.context.fill();
			this.socket.send(JSON.stringify({lineTo: {slide: this.slider.value, x: xv, y: yv}}));
			var tmp = this.context.fillStyle;
			if(erase) this.updCanv();
			//Save
			timgd = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
			this.context.lineWidth = 1;
			this.context.beginPath();
			this.context.arc(xv,yv,history[1],0,Math.PI*2,true);
			this.context.closePath();
			this.context.stroke();
			this.context.fillStyle = tmp;
			erase++;
		}

	}


}
*/
/*
$(function(){
	var drawT = Backbone.Model.extend({
	  		initialize: function() { 
				mouse : "true";
				history : new Array();
				curPos : 0;
				pushDis : 20;
				erase : false; 
				}
	});
	
	
	

	var drawView = Backbone.View.extend({
		el: $('body'),
		events: {
			"mousedown .game": "startLine",
			"mousemove .game" : "drawLine",
			"mouseup .game": "endLine",
			"mousedown .brush" : "changeColor"
		},    	
		initialize: function() {
			console.log('yay');
			this.model = new drawT();
			canvas = $('.game').dom[0];
			context = canvas.getContext("2d");
			timgd = context.getImageData(0,0,canvas.width,canvas.height);
			history = this.model.get("history");
			context.fillStyle = "rgba(0, 0, 0, 0.0)";
			context.fillRect(0, 0, canvas.width, canvas.height);
			canvas.width = canvas.width;
			context.fillStyle = "rgba(0, 0, 0, 0.0)";
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.putImageData(timgd, 0, 0);
			
			erase = false;
			if(!history){
				history = new Array();
				history[0]= -1;
				history[1]= 2;
			}else{
				//Get caught up history
				
			}
			
		},
		changeColor:function(){
			curTool = 1+(curTool%3);
			history[curPos] = -1;
			history[curPos] =  curTool;
			this.model.set({history:history});
			curPos+=2;
		},
		startLine: function(event) {
			isDrawing = true;
			var xv = event.clientX-canvas.offsetLeft;
			var yv = event.clientY-canvas.offsetTop;
			if(curTool==1) context.fillStyle= "rgba(0,0,255,1)";	
			else if(curTool==2) context.fillStyle= "rgba(255,0,0,1)";	
			else if(curTool==3){
				var timgd = context.getImageData(0, 0, canvas.width, canvas.height);
				var pix = timgd.data;
				erase = false;
				var curI = 4*(xv+canvas.width*yv);
				//context.fillStyle= "rgba(255,255,255,1)";
				
				if(pix[curI+3]==0){
					context.fillStyle= "rgba(255,255,255,1)";
					erase = true;
					console.log("Is here");
				}else{
					context.fillStyle= "rgba("+pix[curI]+","+pix[curI+1]+","+pix[curI+2]+","+pix[curI+3]+")";
					console.log("not here");
				}
				
			}
			this.drawLine(event);
		},
		endLine: function(event) {
			isDrawing = false;
			context.putImageData(timgd, 0, 0);
			this.updCanv();	
		},
		drawLine: function(event) {
			if(isDrawing) {
				var xv = event.clientX-canvas.offsetLeft;
				var yv = event.clientY-canvas.offsetTop;
				history[curPos] = xv;
				history[curPos+1] = yv;
				this.model.set({history:history});
				curPos+=2;
				//Load
				context.putImageData(timgd, 0, 0);
				context.beginPath();
				context.arc(xv,yv,20,0,Math.PI*2,true);
				context.closePath();
				context.fill();
				var tmp = context.fillStyle;
				//if(erase) this.updCanv();
				//Save
				timgd=context.getImageData(0, 0, canvas.width, canvas.height)
				context.lineWidth = 1;
				context.strokeStyle = (0,0,0,1);
				context.beginPath();
				context.arc(xv,yv,20,0,Math.PI*2,true);
				context.closePath();
				context.stroke();
				
			}
		},
		updCanv: function(){
				//Joe's awesome algorithm
				//console.log("trouble?");
				var pix = timgd.data;
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
				console.log(curTool);
				
				timgd=context.getImageData(0, 0, canvas.width, canvas.height);
				
				canvas.width = canvas.width;
				context.fillStyle = "rgba(0, 0, 0, 0.0)";
				context.fillRect(0, 0, canvas.width, canvas.height);
				context.putImageData(timgd, 0, 0);
				
				console.log("trouble?3");
				
			}
	});

	window.myView = new drawView;
});



var smaller = new Array();



$(function(exports){

	var timgd;
	var history = new Array();
	var curPos = 0;
	var curTool = 0;
	var isDrawing;
	var context;
	var erase;
	var size = 10;

	var Backbone = require('backbone@0.3.3'),
		_ = require('underscore')._,
		resources = require('./models/resources'),
		drawing = new resources.collections.Drawing;
	
	window.Point = Backbone.View.extend({
		initialize: function() {
			_.bindAll(this, 'render');
			
			
			erase = false;
			this.model.view = this;
			this.canvas = $('.game').dom[0];
			this.ctx = this.canvas.getContext("2d");
			if(curTool == 0){
				erase=false;
				this.ctx.fillStyle = "rgb(0,0,255)";
				this.ctx.strokeStyle = "rgb(0,0,255)";
			}else if(curTool == 1){
				erase=false;
				this.ctx.fillStyle = "rgb(255,0,0)";
				this.ctx.strokeStyle = "rgb(255,0,0)";
			}else if(curTool == 2){
				erase=true;
				this.ctx.fillStyle = "rgb(255,255,255)";
				this.ctx.strokeStyle = "rgb(255,255,255)";
			}
			this.ctx.lineWidth  = size*2;
			timgd = this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);
			if(this.model.get('actType')==3)
				curTool = (curTool+1)%3;
			else if(this.model.get('actType')==4){
				this.load();
			}else{
				this.render();
			}
		},
		updCanv: function() {
			//Joe's awesome algorithm
			//console.log("trouble?");
			timgd=this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
			var pix = timgd.data;
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
			//console.log(curTool);
			this.canvas.width = this.canvas.width;
			this.ctx.fillStyle = "rgba(0, 0, 0, 0.0)";
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.putImageData(timgd, 0, 0);
		},
		load: function()  {
			var c = 0;
			var small = this.model.get('smList');
			//console.log(small);
			var actType;
			var x;
			var y;
			
			
			while(c<small.length){
				actType = small[c].actType;
				x = small[c].x;
				y = small[c].y;
				if(curTool == 0){
					erase = false;
					this.ctx.fillStyle = "rgb(0,0,255)";
					this.ctx.strokeStyle = "rgb(0,0,255)";
				}else if(curTool == 1){
					erase = false;
					this.ctx.fillStyle = "rgb(255,0,0)";
					this.ctx.strokeStyle = "rgb(255,0,0)";
				}else if(curTool == 2){
					erase=true;
					this.ctx.fillStyle = "rgb(255,255,255)";
					this.ctx.strokeStyle = "rgb(255,255,255)";
				}
				
				if(actType==0){
					this.ctx.beginPath();
					this.ctx.arc(x,y, size, 0, Math.PI*2, true); 
					this.ctx.closePath();
					this.ctx.fill();
					isDrawing = true;
					
				} 
				else if(isDrawing && actType==1){
					this.ctx.beginPath();
					this.ctx.arc(x,y, size, 0, Math.PI*2, true); 
					this.ctx.closePath();
					this.ctx.fill();
				}
				else if(actType==2){
					this.ctx.beginPath();
					this.ctx.arc(x,y, size, 0, Math.PI*2, true); 
					this.ctx.closePath();
					this.ctx.fill();
					isDrawing = false;

				}else if(actType==3){
					curTool = (curTool+1)%3;
					
				}
				if(erase) this.updCanv();
			c++;
			}
			return this;
		
			
		},
		render: function() {
			var x = this.model.get('x');
			var y = this.model.get('y');
			
			
			if(this.model.get('actType')==0){
				this.ctx.beginPath();
				this.ctx.arc(x,y, size, 0, Math.PI*2, true); 
				this.ctx.closePath();
				this.ctx.fill();
				isDrawing = true;
			} 
			else if(isDrawing && this.model.get('actType')==1){
				this.ctx.beginPath();
				this.ctx.arc(x,y, size, 0, Math.PI*2, true); 
				this.ctx.closePath();
				this.ctx.fill();
			}
			else if(this.model.get('actType')==2){
				this.ctx.beginPath();
				this.ctx.arc(x,y, size, 0, Math.PI*2, true); 
				this.ctx.closePath();
				this.ctx.fill();
				isDrawing = false;
				
			}
			if(erase) this.updCanv();
			return this;
		}
	});
	

	
	window.AppView = Backbone.View.extend({
		el: $(".area"),
		events: {
			"mousedown .game": "startLine",
			"mousemove .game" : "drawLine",
			"mouseup .game": "endLine",
			"mousedown .brush" : "changeColor"
		},
		initialize: function(event) {
			this.canvas = $('.game').dom[0];
			this.ctx = this.canvas.getContext("2d");
			_.bindAll(this, 'drawPoint', 'drawnPoints');
			_.bindAll(this, 'Load');
			
			var self = this;
			
			drawing.bind('add', this.drawPoint);
				/*
				drawing.bind('refresh', function(data) {
					data.each(function(model){
						if(self.drawnPoints[model.id]) {
							self.drawnPoints[model.id].model.set(model.attributes);
						} else {
							self.drawPoint(model);
						}
					});
				});
			
			
			
		
				// old fashion request to get the current state
				drawing.fetch({success: function(data) {

					var c = 0;
					console.log(data.models.length);


					while(c < data.models.length){
						window.smaller[c] = data.models[c].attributes;
						c++;

					}
					var tmp = window.smaller;
					//console.log(self);
					
				}});
			
			
			
			
			DNode({
				add: function(data) {
					//console.log(data);
					if (!drawing.get(data.id)) drawing.add(data)
				}
			}).connect(function(remote){
				var em = require('events').EventEmitter.prototype;
				remote.subscribe(function () {
					em.emit.apply(em, arguments);
				});
				drawing.bind('dnode:add', function(data){
					remote.add(data);
				});
				drawing.bind('dnode:change', function(data){
					remote.change(data);
				});
				self.Load();
			});
			
			
			
		},
		drawnPoints: {},
		drawPoint: function(model) {
			var point = new Point({model: model});
			this.drawnPoints[model.id] = point;
		},
		startLine: function(event) {
			drawing.trigger('dnode:add', {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop, actType:0, tool:curTool});
		},
		drawLine: function(event) {
			drawing.trigger('dnode:add', {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop, actType:1, tool:curTool});
		},
		endLine: function(event) {
			drawing.trigger('dnode:add', {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop, actType:2, tool:curTool});
		},
		changeColor: function(event) {
			drawing.trigger('dnode:add', {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop, actType:3, tool:curTool});
			//drawing.trigger('dnode:add', {smList: window.smaller, actType:4});
			
		},
		Load: function() {
			//Fix dis dave Should be replace/change
			// get model
			drawing.trigger('dnode:change', {smList: window.smaller, actType:4});
		}
		
	});
	
	window.App = new AppView;
});





*/




$(function(exports){
	var Backbone = require('backbone@0.3.3'),
		_ = require('underscore')._,
		resources = require('./models/resources'),
		drawing = new resources.collections.Drawing,
		view = {};
	
		var timgd;
		var history = new Array();
		var curPos = 0;
		var curTool = 0;
		var isDrawing;
		var context;
		var erase;
		var size = 10;


	window.Point = Backbone.View.extend({
			initialize: function() {
				_.bindAll(this, 'render');
				erase = false;
				this.model.view = this;
				this.canvas = $('canvas').dom[0];
				this.ctx = this.canvas.getContext("2d");
				var actType = this.model.get('actType');
				this.ctx.lineWidth  = size*2;
				timgd = this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);
				if(actType==3)
					curTool = this.model.get('tool');
				else if(actType==4){
					this.load();
				}else{
					var x = this.model.get('x');
					var y = this.model.get('y');
					if(curTool == 0){
						erase=false;
						this.ctx.fillStyle = "rgb(0,0,255)";
						this.ctx.strokeStyle = "rgb(0,0,255)";
					}else if(curTool == 1){
						erase=false;
						this.ctx.fillStyle = "rgb(255,0,0)";
						this.ctx.strokeStyle = "rgb(255,0,0)";
					}else if(curTool == 2){
					
						erase=true;
						this.ctx.fillStyle = "rgb(255,255,255)";
						this.ctx.strokeStyle = "rgb(255,255,255)";
					}
						this.render(x,y,actType);
				}
				
			},
			updCanv: function() {
				//Joe's awesome algorithm
				//console.log("trouble?");
				timgd=this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
				var pix = timgd.data;
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
				//console.log(curTool);
				this.canvas.width = this.canvas.width;
				this.ctx.fillStyle = "rgba(0, 0, 0, 0.0)";
				this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
				this.ctx.putImageData(timgd, 0, 0);
			},
			load: function()  {
				var c = 0;
				var small = this.model.get('smList');
				//console.log(small);
				var actType;
				var x;
				var y;
				//console.log("and now");
				//console.log(small);

				while(c<small.length){
					actType = small[c].actType;
					x = small[c].x;
					y = small[c].y;
					if(actType==3){
						curTool = small[c].tool;
					}else{
						if(curTool == 0){
							erase=false;
							this.ctx.fillStyle = "rgb(0,0,255)";
							this.ctx.strokeStyle = "rgb(0,0,255)";
						}else if(curTool == 1){
							erase=false;
							this.ctx.fillStyle = "rgb(255,0,0)";
							this.ctx.strokeStyle = "rgb(255,0,0)";
						}else if(curTool == 2){

							erase=true;
							this.ctx.fillStyle = "rgb(255,255,255)";
							this.ctx.strokeStyle = "rgb(255,255,255)";
						}
						if(actType==0){
							this.ctx.beginPath();
							this.ctx.arc(x,y, size, 0, Math.PI*2, true); 
							this.ctx.closePath();
							this.ctx.fill();
							isDrawing = true;
						} 
						else if(isDrawing && actType==1){
							this.ctx.beginPath();
							this.ctx.arc(x,y, size, 0, Math.PI*2, true); 
							this.ctx.closePath();
							this.ctx.fill();
						}
						else if(actType==2){
							this.ctx.beginPath();
							this.ctx.arc(x,y, size, 0, Math.PI*2, true); 
							this.ctx.closePath();
							this.ctx.fill();
							isDrawing = false;

						}
						if(erase) this.updCanv();
					}
				c++;
				}
				return this;


			},
			render: function(x,y,actType) {
				if(actType==0){
					this.ctx.beginPath();
					this.ctx.arc(x,y, size, 0, Math.PI*2, true); 
					this.ctx.closePath();
					this.ctx.fill();
					this.ctx.moveTo(x,y);
					this.ctx.beginPath();
					isDrawing = true;
				} 
				else if(isDrawing && actType==1){
					this.ctx.lineTo(x,y);
					this.ctx.closePath();
					this.ctx.stroke();
					this.ctx.beginPath();
					this.ctx.arc(x,y, size, 0, Math.PI*2, true); 
					this.ctx.closePath();
					this.ctx.fill();
					this.ctx.beginPath();
				}
				else if(actType==2){
					this.ctx.lineTo(x,y);
					this.ctx.closePath();
					this.ctx.stroke();
					this.ctx.beginPath();
					this.ctx.arc(x,y, size, 0, Math.PI*2, true); 
					this.ctx.closePath();
					this.ctx.fill();
					isDrawing = false;

				}
				if(erase) this.updCanv();
				return this;
			}
		});

	
	window.CaseView = Backbone.View.extend({
		el: $('#game'),
		events: {
			'click .light_grey_gradient_text': 'selectCase'
		},
		initialize: function() {
			_.bindAll(this, 'render');
			this.render();
		},
		render: function() {
			if (view.cases) {
				console.log('cashed version');
				this.el.html('');
				this.el.html(view.cases);
			} else {
				$.get('/renders/cases.html', function(t){
					this.el.html('');
					view.cases = t;
					this.el.html(view.cases);
				}.bind(this));
			}
			
		},
		selectCase: function(e) {
			//console.log($(e.currentTarget));
			e.preventDefault();
			new ComputerView;
		}
	});
	window.smaller = new Array()
	
	window.ComputerView = Backbone.View.extend({
		el: $('#game'),
		events: {
			'click .light_grey_gradient_text': 'goBack',
			"mousedown .scanvas": "startLine",
			"mousemove .scanvas" : "drawLine",
			"mouseup .scanvas": "endLine",
			"click .brush0": "changeColor0",
			"click .brush1": "changeColor1",
			"click .brush2": "changeColor2",
			"click .brush3": "Load"
		},
		initialize: function() {
			_.bindAll(this, 'render');
			this.render();
			//console.log('yay');	
		},
		goBack: function(e) {
			e.preventDefault();
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
			_.bindAll(this, 'drawPoint', 'drawnPoints');
			_.bindAll(this, 'Load');
			//_.bindAll(this, 'startLine', 'drawLine', 'endLine', 'changeColor0', 'changeColor1', 'changeColor2', 'changeColor3')
			var self = this;
			//console.log(self);
			drawing.bind('add', this.drawPoint);
			// old fashion request to get the current state
			drawing.fetch({success: function(data) {
				var cs = 0;
				var cm = 0;
					//console.log(data);
					//console.log(data.models.length);
					while(cm < data.models.length){
						if(data.models[cm].attributes.actType != 4){
							window.smaller[cs] = data.models[cm].attributes;
							cs++;
						}else{
							var tc = 0;
							while(tc<data.models[cm].attributes.smList.length){
								window.smaller[cs] = data.models[cm].attributes.smList[tc];
								tc++;
								cs++;
							}
						}
						cm++;
					}
					var tmp = window.smaller;
					//console.log(self);

				}});
			DNode({
				add: function(data) {
					//console.log(data);
					if (!drawing.get(data.id)) this.drawPoint(data)
				}
			}).connect(function(remote){
				var em = require('events').EventEmitter.prototype;
				remote.subscribe(function () {
					em.emit.apply(em, arguments);
				});
				drawing.bind('dnode:add', function(data){
					remote.add(data, {
						type: 'drawing'
					});
				});
				drawing.bind('dnode:addWhere', function(data){
					remote.addWhere(data, {
						type: 'drawing'
					},4);
				});
				self.Load();
			});
		},
		drawnPoints: {},
		drawPoint: function(model) {
			var point = new Point({model: model});
			this.drawnPoints[model.id] = point;
		},
		startLine: function(event) {
			drawing.trigger('dnode:add', {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop, actType:0, tool:curTool});
		},
		drawLine: function(event) {
			drawing.trigger('dnode:add', {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop, actType:1, tool:curTool});
		},
		endLine: function(event) {
			drawing.trigger('dnode:add', {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop, actType:2, tool:curTool});
		},
		changeColor0: function(event) {
			drawing.trigger('dnode:add', {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop, actType:3, tool:0});
			//drawing.trigger('dnode:add', {smList: window.smaller, actType:4});

		},
		changeColor1: function(event) {
			drawing.trigger('dnode:add', {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop, actType:3, tool:1});
			//drawing.trigger('dnode:add', {smList: window.smaller, actType:4});

		},
		changeColor2: function(event) {
			drawing.trigger('dnode:add', {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop, actType:3, tool:2});
			//drawing.trigger('dnode:add', {smList: window.smaller, actType:4});

		},
		changeColor3: function(event) {
			drawing.trigger('dnode:add', {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop, actType:3, tool:3});
			//drawing.trigger('dnode:add', {smList: window.smaller, actType:4});

		},
		Load: function() {
			//Fix dis dave Should be replace/change
			// get model
			//console.log(window.smaller);
			drawing.trigger('dnode:addWhere', {smList: window.smaller, actType:4});
		}

	});

	
	window.AppView = Backbone.View.extend({
		el: $('#game'),
		events: {
			'click .light_grey_gradient_text': 'startGame'
		},
		initialize: function() {
			_.bindAll(this, 'render');
			this.render();
		},
		render: function() {
			$.get('/renders/splash.html', function(t){
				this.el.html(t);
			}.bind(this));
		},
		startGame: function(e) {
			e.preventDefault();
			new CaseView;
		}
	});
	window.App = new AppView;
});
