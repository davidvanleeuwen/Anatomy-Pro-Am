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
			console.log ("THIS", this.model);
			//console.log(this.$('fb_player_img').attr('style'));
			this.$('.fb_player').attr('style', 'background-color: #' + this.model.get('player_color'));
			this.$('.fb_player_img').attr('style', 'background: url(\'' + this.model.get('avatar')  + '\');');
			this.$('.fb_player_name').text(this.model.get('name'));
			if(this.model.get('id') != myUID) {
				this.$('a').addClass('invisible');
			}
		},
		remove: function() {
			$(this.el).remove();
		},
		toggleEnabled: function(event) {
			event.preventDefault();
			this.$('a').toggleClass('invisible')
			remote.getColoredPointsForThisLayerAndPlayer(this.model.get('id'), layer, emit);
		}
	});
	em.on('FriendCameOnline', function(n) { 

		console.log("User Connected: " + JSON.stringify(n)); 

		console.log("friendLength: ", friends.length);
		var okToAdd = true;
		friends.each(function(friend){
			if(friend.id == n.id){
				console.log("DUPLICATE");
				okToAdd = false;
			}
		})
		if(okToAdd){
			console.log("OK TO ADD");
			friends.add({
				id: n.id,
				name: n.first_name, 
				player_color: n.player_color,
				avatar: "http://graph.facebook.com/" + n.id + "/picture"
			});
			console.log (friends);
		}
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
			
			//var inset = $('#player-template').html();
			//$(this.el).html(inset);
			friends.unbind();
			_.bindAll(this, 'addFriend', 'removeFriend', 'refreshFriends', 'render');
			friends.bind('add', this.addFriend);
			friends.bind('remove', this.removeFriend);
			friends.bind('refresh', this.refreshFriends);
			friends.fetch();
			console.log("initialize " + friends.length);
			//this.render();
		},
		render: function() {
		console.log("render " + friends.length);
			this.refreshFriends();
		},
		addFriend: function(friend) {
			console.log('add player: ', friend);
			var view = new FriendView({model:friend});
			$(this.el).append(view.render().el);
		},
		removeFriend: function(friend) {
			friend.clear();
		},
		refreshFriends: function() {
		console.log("refresh " + friends.length);
			friends.each(this.addFriend);
		}
 	});
};