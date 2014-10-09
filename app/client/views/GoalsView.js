var Backbone = require('backbone');
var _ = require('underscore');

module.exports = Backbone.View.extend({

	className: 'goalsView',

	initialize: function() {
		
	},

	events: {
		
	},

	render: function() {
		this.$el.html( 'Coming soon...' );
		return this;
	},

	close: function() {
		this.remove();
		this.unbind();
		this.stopListening();
	}

});