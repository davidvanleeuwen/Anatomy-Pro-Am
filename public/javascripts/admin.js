
components.adminView = function(){
	console.log('loading adminView');
	window.allUsers = new resources.collections.Friends;
	window.rooms = {};
	window.AdminView = Backbone.View.extend({
		el: $('#game'),
		events: {
			
		},
		initialize: function() {
			_.bindAll(this, 'render');
			this.render();
			var self = this;
			
			em.on('FriendCameOnline', function(fbUser) {
				this.playerCameOnline(fbUser);
			}.bind(this));
			em.on('FriendWentOffline', function(fbUser) {
				this.playerWentOffline(fbUser);
			}.bind(this));
			em.on('PlayerStartedCase', function(fbUser, activity_id){
				this.playerStartedCase(fbUser, activity_id);
			}.bind(this));
			em.on('playerLeft', function(fbUser){
				this.playerLeftCase(fbUser);
			}.bind(this));
		},
		render: function() {
			console.log ('rendering');
			if (view.admin) {
				console.log('cashed version');
				this.el.html('');
				this.el.html(view.admin);
			} else {
				$.get('/renders/admin.html', function(t){
					this.el.html('');
					view.admin = t;
					this.el.html(view.admin);
				}.bind(this));
			}
		},
		playerCameOnline: function(fbUser){
			allUsers.add (fbUser);
			new PlayerView({model:fbUser});
			
		},
		playerWentOffline: function(fbUser){
			//$('#adminWindow').append ('<p>Player Went Offline</p>');
			//$('#adminWindow').append (JSON.stringify(fbUser));
				
		},
		playerStartedCase: function(fbUser, activity_id){
			console.log (fbUser);
			//$('#adminWindow').append ('<p>Player Started Case</p>');
			//$('#adminWindow').append (JSON.stringify(fbUser));
			
		},
		playerLeftCase: function(fbUser){
			console.log (fbUser);
			//$('#adminWindow').append ('<p>Player Left Case</p>');
			//$('#adminWindow').append (JSON.stringify(fbUser));
		}
	});
	window.PlayerView = Backbone.View.extend({
		el: '#adminWindow',
		initialize: function(){
			this.room_left_template = _.template($('#left_column_template').html());
			this.room_right_template = _.template($('#right_column_template').html());
			this.player_info_template = _.template($('#player_info_template').html());
			this.select_template = _.template($('#select_template').html());
			_.bindAll(this, 'refresh', 'render');
			allUsers.bind('add', this.refresh);
			allUsers.bind('remove', this.refresh);
			allUsers.bind('refresh', this.refresh);
			allUsers.bind('change', this.refresh);
			allUsers.fetch();
		},
		render: function(){

		},
		refresh: function(){
			console.log (this.model);
			$('#adminWindow').append(this.player_info_template());
			$('#new_select').append(this.select_template());
			$('#new_name').html(this.model.first_name);
			$('#room_id').html(this.model.current_case_id);
			
		}
	});
};
