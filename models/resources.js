var Backbone = require('backbone@0.3.3'), 
	_ = require('underscore@1.1.5')._, 
	resources = module.exports = module.exports.resources = {};

resources.models = {};
resources.collections = {};

resources.models.Point = Backbone.Model.extend({ 
	initialize: function() {
		_.bind(this);
	}
});

resources.collections.Drawing = Backbone.Collection.extend({ 
	model: resources.models.Point,
	url: '/drawing'
});