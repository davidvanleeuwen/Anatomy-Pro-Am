components.cases = function(){
	console.log('loading cases');
	window.CaseView = Backbone.View.extend({
		el: $('#game'),
		events: {
			'click .light_grey_gradient_text0': 'selectCase0',
			'click .light_grey_gradient_text1': 'selectCase1'
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
		selectCase0: function(e) {
			e.preventDefault();
			new ComputerView(0);
		},
		selectCase1: function(e) {
			e.preventDefault();
			new ComputerView(1);
		}
	});
};