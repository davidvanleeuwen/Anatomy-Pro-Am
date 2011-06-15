
components.adminView = function(){
	console.log('loading adminView');
	window.allUsers = new resources.collections.Friends;
	window.AdminView = Backbone.View.extend({
		el: $('#game'),
		events:{
			"click #refresh":'fetch',
			
			'click #newCase':'newCase',
			
			'click #move' : 'move'
		},
		initialize: function() {
			_.bindAll(this, 'render', 'refresh');
			this.render();
			allUsers.bind('change', this.refresh);
			allUsers.bind('add', this.refresh);
			allUsers.bind('remove', this.refresh);
			allUsers.bind('refresh', this.refresh);
			allUsers.fetch();
			
			em.on('setCurrentCase', function (room, activity_id){
				$('#room_holder').append('<div>Case: ' + room + " - A_ID: " + activity_id + '</div>');
				remote.leftActivity(activity_id, me);
			});
		},
		render: function() {
			if (view.admin) {
				console.log('cashed version');
				this.el.html('');
				this.el.html(view.admin);
			} else {
				$.get('/renders/admin.html', function(t){
					this.el.html('');
					view.admin = t;
					this.el.html(view.admin);
				}.bind(this));
			}
		},
		move: function (e){
			e.preventDefault();
			remote.sendJoinRequest('JoinRequest', $('#id_' + e.currentTarget.innerText).val(), e.currentTarget.innerText.substr(0,e.currentTarget.innerText.length -1) , me.get('name'), me.get('avatar'));
			console.log (e.currentTarget.innerText);
		},
		newCase: function (e){
			e.preventDefault();
			console.log ($('#newRoom').val());
			remote.newCase($('#newRoom').val(), me, emit);
		},
		fetch: function(e){
			console.log (e);
			e.preventDefault();
			allUsers.fetch();
		},
		refresh: function(){
			//<div class="info_container"><div class="picture"></div><div class="info_right_container"><div class="name"></div><input type='text' id='room'/><input type='text' id='activity'/><input type='submit' value='MOVE'>/</div></div>
			$("#friends_container").html('');
			allUsers.each(function(user){
				console.log (user);
				
				$("#friends_container").append("<table><tr><td><div class='red_button' id='move'><a href=''><span>"+user.get('id')+"</span></a></div></td>");
				$("#friends_container").append('<td><div class="p">Name: ' + user.get("name") + '</div>');
				$("#friends_container").append('<div class="p">ROOM: <input type="text" id="id_' + user.get('id') + '" value="' + user.get("current_case_id") + '"/></div></td></table>');
			});
		}
	});
	

	
};
