$(function(exports){
	var Backbone = require('backbone@0.3.3'),
		_ = require('underscore')._,
		resources = require('./models/resources'),
		drawing = new resources.collections.Drawing,
		view = {};
		
			var players = new resources.collections.Players;
	// please refactor this:
	var timgd;
	var history = new Array();
	var curPos = 0;
	var curTool = 0;
	var isDrawing;
	var context;
	var erase;
	var size = 10;
	
	var amountOfPlayers = 0;

	window.Player = Backbone.View.extend({
		tagName: 'li',
		initialize: function() {
			this.template = _.template($('#player-template').html());
			_.bindAll(this, 'render');
			this.model.bind('change', this.render);
			this.model.view = this;
		},
		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			this.setContent();
			return this;
		},
		setContent: function() {
			console.log(this.model.get('avatar'));
			//console.log(this.$('fb_player_img').attr('style'));
			this.$('.fb_player_img').attr('style', 'background: url(\'' + this.model.get('avatar')  + '\');');
			this.$('span').text(this.model.get('name'));
		},
		remove: function() {
			$(this.el).remove();
		}
	});
	
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
			if (actType==3) {
				curTool = this.model.get('tool');
			} else if (actType==4) {
				this.load();
			} else {
				var x = this.model.get('x');
				var y = this.model.get('y');
				if (curTool == 0) {
					erase=false;
					this.ctx.fillStyle = "rgb(0,0,255)";
					this.ctx.strokeStyle = "rgb(0,0,255)";
				} else if (curTool == 1) {
					erase=false;
					this.ctx.fillStyle = "rgb(255,0,0)";
					this.ctx.strokeStyle = "rgb(255,0,0)";
				} else if(curTool == 2) {
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
					} else if(isDrawing && actType==1){
						this.ctx.beginPath();
						this.ctx.arc(x,y, size, 0, Math.PI*2, true); 
						this.ctx.closePath();
						this.ctx.fill();
					} else if(actType==2){
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
			} else if(isDrawing && actType==1){
				this.ctx.lineTo(x,y);
				this.ctx.closePath();
				this.ctx.stroke();
				this.ctx.beginPath();
				this.ctx.arc(x,y, size, 0, Math.PI*2, true); 
				this.ctx.closePath();
				this.ctx.fill();
				this.ctx.beginPath();
			} else if(actType==2){
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
			/*"mousemove .scanvas" : "drawLine",
			"mouseup .scanvas": "endLine",
			"click .brush0": "changeColor0",
			"click .brush1": "changeColor1",
			"click .brush2": "changeColor2",
			"click .brush3": "Load"*/
		},
		initialize: function() {
			players = new resources.collections.Players;
			players.unbind();
			drawing.unbind();
			_.bindAll(this, 'addOne', 'addAll', 'render');
			players.bind('add', this.addOne);
			players.bind('refresh', this.addAll);
			players.bind('change', this.logger);
			this.render();
			//console.log('yay');	
		},
		logger: function(){
			alckjaoijcalsdkjc;
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
			players.fetch({success: function(data) { console.log(data); } });
		},
		setupView: function() {
			
			console.log("setupview");
			console.log(players);
			//this.addAll(players);
			console.log("endsetupview");
			DNode({
				addPlayer: function(data) {
					console.log(data);
					//if (!players.get(data.id)) players.add(data);
				},
				setPlayerID: function (id){
					playerID = id;
					 if (!aColl.get(data.id)) aColl.add(data);
				},
				returnID: function(id) {
					//console.log(FB.getSession());
				},
				printID: function (id){
					//console.log('my id: ', id);
				}

			}).connect(function(remote){
				var em = require('events').EventEmitter.prototype;
				
				em.on('addPlayer', function(data) {
					console.log(data);
				});
				
				remote.setID(FB.getSession().uid);
				remote.subscribe(function () {
					em.emit.apply(em, arguments);
				});
				drawing.bind('dnode:add', function(data){
					remote.add(data, {
						type: 'drawing'
					});
				});
				//self.Load();
			});
			
			this.canvas = $('canvas').dom[0];
			this.ctx = this.canvas.getContext("2d");
			_.bindAll(this, 'drawPoint', 'drawnPoints');
			_.bindAll(this, 'Load');
			var self = this;
			//console.log(self);
			drawing.bind('add', this.drawPoint);
			// old fashion request to get the current state
			drawing.fetch({success: function(data) {
				var c = 0;
				//console.log(data);
				//console.log(data.models.length);
				while(c < data.models.length){
					window.smaller[c] = data.models[c].attributes;
					c++;
				}
				var tmp = window.smaller;
				//console.log(self);
			}});
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
			drawing.trigger('dnode:add', {smList: window.smaller, actType:4});
		},
		addAll: function() {
			console.log("addall");
			console.log(players.length);
			players.each(this.addOne);
		},
		addOne: function(player) {
			var view = new Player({model: player});
			this.$('#fb_friends_container').append(view.render().el);
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
