$(function(exports){
	var Backbone = require('backbone@0.3.3'),
		_ = require('underscore')._,
		resources = require('./models/resources'),
		drawing = new resources.collections.Drawing;
	
	window.Point = Backbone.View.extend({
		initialize: function() {
			_.bindAll(this, 'render');
			this.model.view = this;
			this.canvas = $('.game').dom[0];
			this.ctx = this.canvas.getContext("2d");
			this.render();
		},
		render: function() {
			this.ctx.beginPath();
			this.ctx.arc(this.model.get('x'), this.model.get('y'), 10, 0, Math.PI*2, true); 
			this.ctx.closePath();
			this.ctx.fill();
			return this;
		}
	});
	
	window.AppView = Backbone.View.extend({
		el: $(".area"),
		events: {
			"mousedown .game": "setNewPoint"
		},
		initialize: function() {
			this.canvas = $('.game').dom[0];
			this.ctx = this.canvas.getContext("2d");
			DNode().connect(function(remote){
				var em = require('events').EventEmitter.prototype;
				remote.subscribe(function () {
					em.emit.apply(em, arguments);
				});
				drawing.bind('dnode:create', function(){
					remote.create();
				});
			});
		},
		setNewPoint: function(event) {
			//new Point({x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop});
			drawing.trigger('dnode:create');
		}
	});
	
	window.App = new AppView;
});
