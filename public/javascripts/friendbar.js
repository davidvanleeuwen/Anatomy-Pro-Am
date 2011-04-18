components.friendbar = function(){
	console.log('loading friendbar');
	
	window.friends = new resources.collections.Friends;
	  
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
			if(this.model.get('id') == myUID) {
				this.model.set({layer_enabled: true},{silent: true});
				this.$('a').removeClass('invisible');
			}
		},
		remove: function() {
			$(this.el).remove();
		},
		toggleEnabled: function(event) {
			event.preventDefault();
			this.model.toggleVisibility();
			if(this.model.get('layer_enabled')){
				this.$('a').removeClass('invisible');
			}else{
				this.$('a').addClass('invisible');
			}
			var canvas = $('canvas')[0];
			var ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			friends.each(function(friend){
				if(friend.get('layer_enabled')){
					remote.getColoredPointsForThisLayerAndPlayer(myUID, friend.id, layer, emit);
				}
			});
		}
	});
	
	em.on('FriendCameOnline', function(n) {
		var okToAdd = true;
		friends.each(function(friend){
			if(friend.id == n.id){
				okToAdd = false;
			}
		})
		if(okToAdd){
			console.log("addinguser");
			friends.add({
				id: n.id,
				name: n.first_name, 
				player_color: n.player_color,
				avatar: "http://graph.facebook.com/" + n.id + "/picture",
				layer_enabled: false
			});
		}
		
	});
		
	em.on('FriendWentOffline', function(n) {
		var m = friends.get(n.id);
		friends.remove(m);
	});
	
	window.FriendBar = Backbone.View.extend({
		el: '#fb_friends_container',
		initialize: function() {
			friends.unbind();
			_.bindAll(this, 'addFriend', 'removeFriend', 'refreshFriends', 'render');
			friends.bind('add', this.addFriend);
			friends.bind('remove', this.removeFriend);
			friends.bind('refresh', this.refreshFriends);
			friends.fetch();
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
			friends.each(this.addFriend);
		}
 	});
};