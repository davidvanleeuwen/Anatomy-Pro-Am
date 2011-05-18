components.cases = function(){
	console.log('loading cases');
	window.CaseView = Backbone.View.extend({
		el: $('#game'),
		events: {
			'click .light_grey_gradient_text': 'selectCase',
			"click #accept_invite":"pagerAcceptInvite",
			"click #decline_invite":"pagerDeclineInvite"
		},
		initialize: function() {
			_.bindAll(this, 'render');
			this.render();
			var self = this;
			em.on('JoinRequest', function(caseNumber, player_id, player_name, player_avatar) {
				invitation['case_id'] = caseNumber;
				invitation['player_id'] = player_id;
				invitation['player_name'] = player_name;
				invitation['player_avitar'] = player_avatar;
				$('#invitation_text').text(player_name + ' has invited you to help with their case.  Would you like to join them?');
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
		selectCase: function(e) {
			e.preventDefault();
			//Passing 283408 for the room number for now - indicates activity - this will be auto generated later on
			remote.newCase(283408, me, emit);
			new ComputerView();
		},	
		pagerAcceptInvite: function (e){
			e.preventDefault();
			console.log ('received case id ' + invitation['case_id']);
			remote.joinActivity(invitation['case_id'], me);
			me.set({current_case_id: invitation['case_id']});
			online_friends.each(function (friend){
				if (friend.get('id') == me.get('id')){
					friend.set({current_case_id: invitation['case_id']});
					console.log ('changed friend case id');
				}
			});
			new ComputerView;
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