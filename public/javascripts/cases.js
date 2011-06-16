components.cases = function(){
	console.log('loading cases');
	window.CaseView = Backbone.View.extend({
		el: $('#game'),
		events: {
			'click #case1': 'selectCase1',
			'click #case2': 'selectCase2',
			'click #coming_soon_button': 'closeComingSoon',
			"click #accept_invite":"pagerAcceptInvite",
			"click #decline_invite":"pagerDeclineInvite",
			"click .coming_soon_trigger":"openComingSoon"
		},
		initialize: function() {
			_.bindAll(this, 'render');
			this.render();
			var self = this;
			em.on('JoinRequest', function(activity_id, case_number, player_id, player_name, player_avatar) {
				invitation['activity_id'] = activity_id;
				invitation['case_number'] = case_number;
				invitation['player_id'] = player_id;
				invitation['player_name'] = player_name;
				invitation['player_avitar'] = player_avatar;
				$('.pager_facebook_image').attr('style', 'background: url(\'' + player_avatar + '?type=normal\') no-repeat; ');
				$('#invitation_text').html('<h3>' + player_name + ' requests your opinion.</h3>');
				console.log ('received invitation');
				self.showPager(true);
			});
		},
		render: function() {
			if (view.cases) {
				console.log('cashed version');
				this.el.html('');
				this.el.html(view.cases);
			} else {
				$.get('/renders/cases.html', function(t){
					this.el.html('');
					view.cases = t;
					this.el.html(view.cases);
				}.bind(this));
			}
		},
		closeComingSoon: function(e){
			e.preventDefault();
			$('#coming_soon').hide();
		},
		openComingSoon: function(e){
			e.preventDefault();
			$('#coming_soon').show();
			console.log ('ComingSoon');
		},
		selectCase1: function(e) {
			e.preventDefault();
			//Passing 283408 for the room number for now - indicates activity - this will be auto generated later on
			
			remote.newCase(1, me, emit);
			new ComputerView(1);
		},	
		selectCase2: function(e) {
			e.preventDefault();
			//Passing 283408 for the room number for now - indicates activity - this will be auto generated later on
			
			remote.newCase(2, me, emit);
			new ComputerView(2);
		},
		pagerAcceptInvite: function (e){
			e.preventDefault();
			console.log ('received case id ' + invitation['activity_id']);
			remote.joinActivity(invitation['activity_id'], me);
			me.set({current_case_id: invitation['activity_id']}, {silent:true});
			online_friends.each(function (friend){
				if (friend.get('id') == me.get('id')){
					friend.set({current_case_id: invitation['activity_id']}, {silent:true});
					console.log ('changed friend case id');
				}
			});
			new ComputerView(invitation['case_number']);
		},
		pagerDeclineInvite: function (e){
			e.preventDefault();
			this.showPager (false);
		},
		showPager: function (b){
			if(b){
				this.$(".pager").show();
			}else{	
				this.$(".pager").hide();
			}
		}
	});
};