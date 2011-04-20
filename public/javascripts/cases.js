components.cases = function(){
	console.log('loading cases');
	window.CaseView = Backbone.View.extend({
		el: $('#game'),
		events: {
			'click .light_grey_gradient_text': 'selectCase'
		},
		initialize: function() {
			_.bindAll(this, 'render');
			this.render();
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
		}
	});
};