$(function(){
	console.log('loading app');
	
	// change this to mixin views
	window.view = {};
	
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
			
			// change this to something global to destroy it
			new CaseView;
		}
	});
	if(AUTH_TOKEN != '') {
		DNode().connect(function(remote){
			window.remote = remote;
			console.log("LIDSJFLJ");
			remote.subscribe(AUTH_TOKEN, emit);
			em.on('myUID', function(uid) {
				window.myUID = uid;
			});
		});
	
		window.app = new AppView;
		util.sync();
		components.cases();
		components.friendbar();
		components.drawing();	
	}
});
