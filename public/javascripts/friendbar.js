components.friendbar = function(){
	console.log('loading friendbar');
	window.invited = [];
	window.online_friends = new resources.collections.Friends;
	/*
	Current View Values - changes depending on tabs pressed, which views the user wants to see
	0 = teammates
	1 = all online friends
	*/
	window.currentView = 0;
	window.FriendView = Backbone.View.extend({
		tagName: 'li',
		events: {
			'click a': 'clickHandler'
		},
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
			this.$('.fb_player').attr('style', 'background-color: #' + this.model.get('player_color'));
			this.$('.fb_player').attr('id', this.model.get('id'));
			this.$('.fb_player_img').attr('style', 'background: url(\'' + this.model.get('avatar')  + '\');');
			this.$('.fb_player_name').text(this.model.get('name'));
			if(this.model.get('id') == me.id || currentView == 1) {
				this.model.set({layer_enabled: true},{silent: true});
				this.$('a').removeClass('invisible');
			}
		},
		remove: function() {
			$(this.el).remove();
		},
		clickHandler: function(event) {
			event.preventDefault();
			console.log(this.model);
			console.log (this.model.get('current_case_id') );
			console.log	(me.get('current_case_id'));
			if (this.model.get('current_case_id') == me.get('current_case_id')){
				this.model.toggleVisibility();
				if(window.dThis.ctxArr&&window.dThis.ctxArr[this.model.get('id')])	window.dThis.ctxArr[this.model.get('id')].clearRect(0, 0, window.dThis.canvas.width, window.dThis.canvas.height);
				online_friends.each(function(friend){
					if(friend.get('layer_enabled')){
						remote.getColoredPointsForThisLayerAndPlayer(me.get('current_case_id'), me.get('id'), friend.id, layer, emit);
					}
				});
			}else{
				this.invitePlayer(this.model);
			}
		},
		invitePlayer: function (model){
			$('.friend_container_2').attr('style', 'background: url(\'' + model.get('avatar')  + '\');');
			$('.invitation_text').html('<h2 class="light_grey_gradient_text">WOULD YOU LIKE TO INVITE ' + model.get('name').toUpperCase() + ' TO THIS CASE?</h2>');
			$('.invite_popup').show();
			invited['player_id'] = model.get('id');
		}
	});
	
	em.on('FriendCameOnline', function(n) {
		var okToAdd = true;
		online_friends.each(function(friend){
			if(friend.id == n.id){
				okToAdd = false;
			}
		})
		if(okToAdd){
			console.log("addinguser to onlineusers");
			online_friends.add({
				id: n.id,
				facebook_id: n.id,
				name: n.first_name, 
				player_color: n.player_color,
				avatar: "http://graph.facebook.com/" + n.id + "/picture",
			});
		}
		
	});
	em.on('FriendWentOffline', function(n) {
		var m = online_friends.get(n.id);
		online_friends.remove(m);
	});
	em.on('PlayerStartedCase', function (userInfo, AID){
		online_friends.each(function (friend){
			if (friend.id == userInfo.id){
				friend.set({current_case_id: AID});
			}
		});
		if (userInfo.id == me.get('id')){
			me.set({current_case_id:AID});
		}
	});

	
	window.FriendBar = Backbone.View.extend({
		el: '#fb_friends_container',
		initialize: function() {
			this.bar_template = _.template($('#friend-bar-template').html());
			$('#friends_container').html(this.bar_template());
			online_friends.unbind();
			_.bindAll(this, 'addFriend', 'removeFriend', 'refreshFriends', 'render');
			online_friends.bind('add', this.refreshFriends);
			online_friends.bind('remove', this.removeFriend);
			online_friends.bind('refresh', this.refreshFriends);
			online_friends.bind('change', this.refreshFriends);
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
			console.log ('Ahh, Refreshing!');
			console.log (online_friends.length);
			$('#friends_container').html(this.bar_template());
			online_friends.each(function (friend){
				console.log (friend.get('current_case_id')  + "     " + me.get('current_case_id'));
				if (currentView == 0){
					if (friend.get('current_case_id') == me.get('current_case_id')){
						console.log (' adding for 0');
						window.friendbar.addFriend (friend);
					}
				}
				if (currentView == 1){
					if (friend.get('current_case_id') != me.get('current_case_id')){
						console.log (' adding for 1');
						window.friendbar.addFriend (friend);
					}
				}
			});
		}
 	});
};