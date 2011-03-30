$(function(){
	window.AppView = Backbone.View.extend({
		el: $(".area"),
		events: {
			"mousedown .game": "startSettingPoint",
			"mouseup .game": "stopSettingPoint",
			"mousemove .game": "setNewPoint"
		},
		initialize: function() {
			this.canvas = $('.game').dom[0];
			this.ctx = this.canvas.getContext("2d");
			this.ctx.fillStyle = "rgba(200,0,0,0.3)";
		},
		startSettingPoint: function(event) {
			this.isDrawing = true;
		},
		stopSettingPoint: function(event) {
			this.isDrawing = false;
		},
		setNewPoint: function(event) {
			if(this.isDrawing) {
				var _x = event.clientX-this.canvas.offsetLeft, 
					_y = event.clientY-this.canvas.offsetTop;

				this.ctx.beginPath();
				this.ctx.arc(_x, _y, 10, 0, Math.PI*2, true); 
				this.ctx.closePath();
				this.ctx.fill();
			}
		}
	});
	
	window.App = new AppView;
});
