var Backbone = require('backbone@0.3.3'), 
	_ = require('underscore@1.1.5')._, 
	resources = module.exports = module.exports.resources = {};

resources.models = {};
resources.collections = {};

/*
 *	Case model
 *	@images
 */
resources.models.Case = Backbone.Model.extend({ 
	initialize: function() {
		_.bind(this);
	}
});

/*
 *	Point model
 *	@x
 *	@y
 */
resources.models.Point = Backbone.Model.extend({ 
	initialize: function() {
		_.bind(this);
	}
});

/*
 *	Player model
 *	@facebook_id
 */
resources.models.Player = Backbone.Model.extend({ 
	initialize: function() {
		_.bind(this);
	}
});

/*
 *	Drawing collection
 *	@point
 */
resources.collections.Drawing = Backbone.Collection.extend({ 
	model: resources.models.Point,
	url: '/drawing'
});

/*
 *	Players collection
 *	@player
 */
resources.collections.Players = Backbone.Collection.extend({ 
	model: resources.models.Player,
	url: '/players'
});

/*
 *	Friend model
 *	@facebook_id
 */
resources.models.Friend = Backbone.Model.extend({ 
	initialize: function() {
		_.bind(this);
	}
});

/*
 *	Friends collection
 *	@friend
 */
resources.collections.Friends = Backbone.Collection.extend({ 
	model: resources.models.Friend,
	url: '/friends'
});

