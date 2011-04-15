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
				this.$('a').toggleClass('invisible');
			}
		},
		remove: function() {
			$(this.el).remove();
		},
		toggleEnabled: function(event) {
			event.preventDefault();
			this.$('a').toggleClass('invisible');
			
			// refactor this to a non-global selector! GET ALL THIS UGLY CODE OUT OF HERE PLEASE!
			var canvas = $('canvas')[0];
			var ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			var friendElements = $('#fb_friends_container').children();
			friendElements.each(function(i, friendEl) {
				if($(friendEl).attr('id') != 'player-template') {
					var a = $(friendEl).find('a');
					if(!$(a).hasClass('invisible')) {
						var idEl = $(friendEl).find('.fb_player');
						remote.getColoredPointsForThisLayerAndPlayer($(idEl).attr('id'), layer, emit);
					}
				}
			}.bind(this));
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
			friends.add({
				id: n.id,
				name: n.first_name, 
				player_color: n.player_color,
				avatar: "http://graph.facebook.com/" + n.id + "/picture"
				
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