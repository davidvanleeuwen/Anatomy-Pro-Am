components.friendbar = function(){
	console.log('loading friendbar');
	window.invited = [];
	window.listState = new resources.collections.Friends;
	window.online_friends = new resources.collections.Friends;
	window.online_friends_page = 0;
	window.all_online_friends = new resources.collections.Friends;
	/*
	Current View Values - changes depending on tabs pressed, which views the user wants to see
	0 = teammates
	1 = Other Players Online
	2 = All Friends Online
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
			// 
			var onteam = 0;
			online_friends.each(function(friend){if (friend.get('current_case_id') == me.get('current_case_id')){onteam++;}});
			if (currentView == 1 && onteam < 6){
				this.$('.fb_player').attr('style', 'background-color: #220000');
			}else{
					this.$('.fb_player').attr('style', 'background-color: #' + this.model.get('player_color'));
			}
			this.$('.fb_player').attr('id', this.model.get('id'));
			this.$('.fb_player_img').attr('style', 'background: url(\'' + this.model.get('avatar')  + '\');');
			this.$('.fb_player_name').text(this.model.get('name'));
			var setVisible = false;
			if(this.model.get('id') == me.id  || currentView == 1 || currentView == 2) {
				setVisible = true;
			}
			if (listState != undefined && listState != null){	
				if (listState[this.model.get('id')] != undefined && listState[this.model.get('id')] != null){
					if (listState[this.model.get('id')].layer_enabled){
						setVisible = true;
					}
					if (listState[this.model.get('id')].layer_enabled == false && this.model.get('id') == me.id){
						setVisible = false;
					}
				}
			}
			if (setVisible){
				this.model.set({layer_enabled: true},{silent: true});
				this.$('a').removeClass('invisible');	
			}
		},
		remove: function() {
			$(this.el).remove();
		},
		clickHandler: function(event) {
			event.preventDefault();
			if (this.model.get('current_case_id') == me.get('current_case_id')){
				this.model.toggleVisibility();
				if(window.dThis.ctxArr&&window.dThis.ctxArr[this.model.get('id')])	window.dThis.ctxArr[this.model.get('id')].clearRect(0, 0, window.dThis.canvas.width, window.dThis.canvas.height);
				online_friends.each(function(friend){
						online_friends.get(friend.get('id')).set({'layer_enabled': true},{silent: true});
						remote.getColoredPointsForThisLayerAndPlayer(me.get('current_case_id'), me.get('id'), friend.id, layer, emit);if(friend.get('layer_enabled')){
						listState = {}
						online_friends.each (function (f){
							listState[f.get ('id')] = {layer_enabled: f.get('layer_enabled')};
						});
					}
				});
			}else{
				if (currentView == 1){
					var onteam = 0;
					online_friends.each(function(friend){if (friend.get('current_case_id') == me.get('current_case_id')){onteam++;}});
					if (onteam < 6){
						this.invitePlayer(this.model);
					}
				}
				if (currentView == 2){
					FB.ui({method: 'apprequests', to: this.model.get('id'), message: me.get('name') + " needs your help with a tough case!", title: "Help!"});
				}
			}
		},
		invitePlayer: function (model){
			$('.friend_container_2').attr('style', 'background: url(\'' + model.get('avatar')  + '?type=normal\') no-repeat; background-size: 100%;');
			$('.invitation_text').html('<h2 class="light_grey_gradient_text">WOULD YOU LIKE TO INVITE ' + model.get('name').toUpperCase() + ' TO THIS CASE?</h2>');
			$('.invite_popup').show();
			invited['player_id'] = model.get('id');
		}
	});
	em.on('setAllFriends', function (friendList){
		all_online_friends = new resources.collections.Friends;
		_.each(friendList.payload, function (friend){
			n = friend.name.split(" ");
			all_online_friends.add({
				id: friend.uid,
				facebook_id: friend.uid,
				name: n[0], 
				player_color: "333333",
				avatar: "http://graph.facebook.com/" + friend.uid + "/picture",
				layer_enabled: true
			});
		});
		
		$('#friends_tab').html('<a href=""><span>FRIENDS (' + all_online_friends.length +')</span></a>');
	});
	em.on('FriendCameOnline', function(n) {
		var okToAdd = true;
		online_friends.each(function(friend){
			if(friend.id == n.id){
				okToAdd = false;
			}
		})
		if(okToAdd){
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
			remote.getOnlineFriends(me.get('id'), emit);
			online_friends.unbind();
			_.bindAll(this, 'addFriend', 'removeFriend', 'refreshFriends', 'render');
			all_online_friends.bind('add', this.refreshFriends);
			all_online_friends.bind('change', this.refreshFriends);
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
			var online = 0;
			var onteam = 0;
			online_friends.each(function (friend){
				if (friend.get('current_case_id') == me.get('current_case_id')){onteam++;}
				if (friend.get('current_case_id') != me.get('current_case_id')){online++;}
			});
			$('#team_tab').html('<a href=""><span>TEAM (' + onteam +')</span></a>');
			$('#online_tab').html('<a href=""><span>ONLINE (' + online +')</span></a>');
			$('#friends_tab').html('<a href=""><span>FRIENDS (' + all_online_friends.length +')</span></a>');
		},
		refreshFriends: function() {
			$('#friends_container').html(this.bar_template());
			var online = 0;
			var onteam = 0;
			var allfriends = 0;
			if (currentView == 2){
				all_online_friends.each (function (friend){
					allfriends++;
					if (allfriends <= 6){
						window.friendbar.addFriend (friend);
					}
				});
			}
			online_friends.each(function (friend){
				
				if (friend.get('current_case_id') == me.get('current_case_id')){
					onteam++;
					if (currentView == 0){
						if (onteam <= 6){
							window.friendbar.addFriend (friend);
						}
					}
				}
				if (friend.get('current_case_id') != me.get('current_case_id')){
					online++;
					if (currentView == 1){
						if (online <= 6){
							window.friendbar.addFriend (friend);
						}
					}
				}
			});
			$('#team_tab').html('<a href=""><span>TEAM (' + onteam +')</span></a>');
			$('#online_tab').html('<a href=""><span>ONLINE (' + online +')</span></a>');
			$('#friends_tab').html('<a href=""><span>FRIENDS (' + all_online_friends.length +')</span></a>');
			
		}
 	});
};