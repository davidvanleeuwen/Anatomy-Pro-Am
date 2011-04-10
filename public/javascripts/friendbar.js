components.friendbar = function(){
	console.log('loading friendbar');
	
	window.friends = new resources.collections.Friends;
	
	window.Friend = Backbone.View.extend({
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
	
	em.on('FrienCameOnline', function(n) { friends.add(n); });
	em.on('FriendWentOffline', function(n) { friends.remove(n); });
	
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
			
		},
		addFriend: function(friend) {
			console.log('add player: ', friend);
		},
		removeFriend: function(friend) {
			console.log('removed player: ', friend);
		},
		refreshFriends: function() {
			friends.each(this.addFriend);
		}
 	});
	//window.friendbar = new FriendBar;
};