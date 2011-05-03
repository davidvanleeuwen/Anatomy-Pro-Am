$(function(){
	console.log('loading app');
	
	// change this to mixin views
	window.view = {};
	window.me = new resources.models.Person;
	
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
			//new CaseView;
			remote.login(document.myform.pword.value, emit);
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
			em.on('setCurrentCase', function(currentCase) {
				me.set({
				current_case_id: currentCase
				}, {silent: true});
			});
			em.on('JoinRequest', function(caseNumber, playerid) {
				alert ('Join This Case: ' + caseNumber);
			});
			em.on('Continue', function(){
				new CaseView;
			});
		});
	
		window.app = new AppView;
		util.sync();
		components.cases();
		components.friendbar();
		components.drawing();	
	}
});
