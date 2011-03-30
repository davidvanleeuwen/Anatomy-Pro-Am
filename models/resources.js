var Backbone = require('backbone@0.3.3'), 
	_ = require('underscore')._, 
	resources = module.exports = module.exports.resources = {};

resources.models = {};
resources.collections = {};

resources.models.Point = Backbone.Model.extend({ 
	initialize: function() {
		_.bind(this);
		console.log('init point model');
	}
});

resources.collections.Drawing = Backbone.Collection.extend({ 
	model: resources.models.Point,
	url: '/drawing'
});