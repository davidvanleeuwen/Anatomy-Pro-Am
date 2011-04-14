components.friendbar = function(){
	console.log('loading friendbar');
	
	window.friends = new resources.collections.Friends;
	  
	window.FriendView = Backbone.View.extend({
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
			//console.log(this.$('fb_player_img').attr('style'));
			this.$('.fb_player_img').attr('style', 'background: url(\'' + this.model.get('avatar')  + '\');');
			this.$('span').text(this.model.get('name'));
		},
		remove: function() {
			$(this.el).remove();
		}
	});
	em.on('FriendCameOnline', function(n) { 
		console.log("User Connected: " + n); 
		friends.add({
			id: n.id,
			name: n.first_name,
			avatar: "http://graph.facebook.com/" + n.id + "/picture"
		});
		console.log (friends);
		});
	em.on('FriendWentOffline', function(n) { 
		console.log("User Disconnected: " + n); 
		var m = friends.get(n.id);
		console.log(friends);
		friends.remove(m);
		console.log(friends);
		});
	
	window.FriendBar = Backbone.View.extend({
		el: '#fb_friends_container',
		initialize: function() {
			_.bindAll(this, 'addFriend', 'removeFriend', 'refreshFriends', 'render');
			friends.bind('add', this.addFriend);
			friends.bind('remove', this.removeFriend);
			friends.bind('refresh', this.refreshFriends);
			friends.fetch();
			this.render();
		},
		render: function() {
			this.refreshFriends();
		},
		addFriend: function(friend) {
			console.log('add player: ', friend);
			var view = new FriendView({model:friend});
			$(this.el).append(view.render().el);
		},
		removeFriend: function(friend) {
			console.log('removed player: ', friend);
			console.log("Clear Friend");
			friend.clear();
			var inset = '<script type="text/template" id="player-template">				<div class="fb_player">					<div class="fb_player_img"></div>					<span></span>				<div>			</script>';
			$(this.el).html(inset);
			console.log(friends);
			this.refreshFriends();
		},
		refreshFriends: function() {
			friends.each(this.addFriend);
			
		}
 	});
};