components.friendbar = function(){
	console.log('loading friendbar');
	
	window.online_friends = new resources.collections.Friends;
	window.friends_in_same_activity = new resources.collections.Friends;
	
	window.FriendView = Backbone.View.extend({
		tagName: 'li',
		events: {
			'click a': 'toggleEnabled'
		},
		initialize: function() {
			this.template = _.template($('#player-template').html());
			_.bindAll(this, 'render');
			//this.model.unbind();
			this.model.bind('change', this.render);
			this.model.view = this;
		},
		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			this.setContent();
			return this;
		},
		setContent: function() {
			//console.log(this.$('fb_player_img').attr('style'));
			this.$('.fb_player').attr('style', 'background-color: #' + this.model.get('player_color'));
			this.$('.fb_player').attr('id', this.model.get('id'));
			this.$('.fb_player_img').attr('style', 'background: url(\'' + this.model.get('avatar')  + '\');');
			this.$('.fb_player_name').text(this.model.get('name'));
			if(this.model.get('id') == me.id) {
				this.model.set({layer_enabled: true},{silent: true});
				this.$('a').removeClass('invisible');
			}
		},
		remove: function() {
			$(this.el).remove();
		},
		toggleEnabled: function(event) {
			event.preventDefault();
			this.joinCase(me.get('id')); //this will be filled with the person of whom you click and want to join, will also not be found here, but on clicking someone else;
			this.model.toggleVisibility();
			
			var canvas = $('canvas')[0];
			var ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			online_friends.each(function(friend){
				if(friend.get('layer_enabled')){
					remote.getColoredPointsForThisLayerAndPlayer(me.get('current_case_id'), me.get('id'), friend.id, layer, emit);
				}
			});
		},
		joinCase: function (toField){
			//remote.sendJoinRequest('JoinRequest', me.get('current_case_id'), toField);
		}
	});
	
	em.on('FriendCameOnline', function(n) {
		var okToAdd = true;
		online_friends.each(function(friend){
			if(friend.id == n.id){
				okToAdd = false;
				var activity = me.get('current_case_id');
				me = n;
				me.set ({current_case_id: activity},{silent: true});
			}
		})
		if(okToAdd){
			console.log("addinguser");
			online_friends.add({
				id: n.id,
				name: n.first_name, 
				player_color: n.player_color,
				avatar: "http://graph.facebook.com/" + n.id + "/picture",
				layer_enabled: false
			});
		}
		
	});
		
	em.on('FriendWentOffline', function(n) {
		var m = online_friends.get(n.id);
		online_friends.remove(m);
	});
	
	window.FriendBar = Backbone.View.extend({
		el: '#fb_friends_container',
		initialize: function() {
			online_friends.unbind();
			_.bindAll(this, 'addFriend', 'removeFriend', 'refreshFriends', 'render');
			online_friends.bind('add', this.addFriend);
			online_friends.bind('remove', this.removeFriend);
			online_friends.bind('refresh', this.refreshFriends);
			online_friends.fetch();
		},
		render: function() {
			this.refreshFriends();
		},
		addFriend: function(friend) {
			var view = new FriendView({model:friend});
			$(this.el).append(view.render().el);
		},
		removeFriend: function(friend) {
			friend.clear();
		},
		refreshFriends: function() {
			online_friends.each(this.addFriend);
		}
 	});
};