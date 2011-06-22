$(function(){
	console.log('loading app');
	
	// change this to mixin views
	window.view = {};
	window.me = new resources.models.Person;
	
	window.AppView = Backbone.View.extend({
		el: $('#game'),
		events: {
			'click .light_grey_gradient_text': 'startGame',
			'keyup #pass':'startGame',
			'click #show_password':'showPassword'
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
		showPassword: function (e){
			e.preventDefault();
			$("#password_bar").show();
		},
		startGame: function(e) {
			e.preventDefault();
			// change this to something global to destroy it
			
			if(e.type == "click" || e.keyCode == 13) {
				//new CaseView;
				remote.login($('#pass').val(), emit);
			}
		}
	});
	if(AUTH_TOKEN != '') {
		DNode().connect(function(remote){
			window.remote = remote;
			remote.subscribe(AUTH_TOKEN, emit);
			em.on('myINFO', function(myInfo, color) {
				me.set({
					id: myInfo.id,
					facebook_id: myInfo.id,
					name: myInfo.first_name,
					player_color: myInfo.player_color, 
					avatar: "http://graph.facebook.com/" + myInfo.id + "/picture"
				}, {silent: true});
			});
			em.on('setCurrentCase', function(caseNum, currentCase) {
				console.log ('current case' + currentCase);
				me.set({
				current_case_id: currentCase
				}, {silent: true});
			});
			em.on('Continue', function(){
				new CaseView;
			});
			em.on('AdminPanel', function(){
				new AdminView;
			});
		});
		window.app = new AppView;
		
		components.adminView();
		components.cases();
		components.friendbar();
		components.drawing();	
	}
});
