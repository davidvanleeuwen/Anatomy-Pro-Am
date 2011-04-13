components.drawing = function(){
	console.log('loaded drawing');
	
	window.ComputerView = Backbone.View.extend({
		el: $('#game'),
		events: {
			'click .light_grey_gradient_text': 'goBack',
			"mousedown .scanvas": "startLine",
			"mousemove .scanvas" : "drawLine",
			"mouseup .scanvas": "endLine",
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
			this.canvas = $('canvas')[0];
			this.ctx = this.canvas.getContext("2d");
			_.bindAll(this, 'colorPoint');
			
			// queue per user for drawing points, we might want to refactor this and add this info to the user model?
			this.users = {};
			
			em.on('stopColoring', function(player_id) {
				var user = this.users[player_id];	
				user.isDrawing = false;
			}.bind(this));
			
			em.on('pointColered', function(player_id, point) {
				var user = this.users[player_id];
				
				if(!user) {
					user = this.users[player_id] = {};
					user.isDrawing = true;
				}
				
				if(user.isDrawing && user.x != 0 && user.y != 0) {
					this.colorPoint(user.x, user.y, point.x, point.y, 1);
				}
				
				user.x = point.x;
				user.y = point.y;
				user.isDrawing = true;
			}.bind(this));
			
			em.on('pointErased', function(player_id, point) {
				console.log(player_id, point)
			});
			
			// fixtures for the images (scans):
			var imageRefs = ['/images/cases/case1/1.png', '/images/cases/case1/2.png','/images/cases/case1/3.png', '/images/cases/case1/4.png'];
			
			imageRefs.forEach(function(img){
				if(imageRefs.indexOf(img) == imageRefs.length-1) {
					this.$('#images').append('<img src="'+img+'" />');
				} else {
					this.$('#images').append('<img src="'+img+'" />');
				}
			});
		},
		goBack: function(e) {
			e.preventDefault();
			delete this;
			new CaseView;
		},
		colorPoint: function(previous_x, previous_y, next_x, next_y, tool) {
			this.ctx.strokeStyle = "rgb(255,0,0)";
			this.ctx.lineWidth = 3;
			this.ctx.beginPath();
			this.ctx.moveTo(previous_x, previous_y);
			this.ctx.lineTo(next_x, next_y);
			this.ctx.closePath();
			this.ctx.stroke();
		},
		startLine: function(event) {
			this.isDrawing = true;
			remote.pointColored(myUID, {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop});
		},
		drawLine: function(event) {
			if(this.isDrawing) {
				remote.pointColored(myUID, {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop});
			}
		},
		endLine: function(event) {
			this.isDrawing = false;
			remote.stopColoring(myUID);
		},
		changeLayer: function(event) {
			var slide = $('.slider').dom[0].value;
			console.log($.siblings('#images'));
		}
	});
};