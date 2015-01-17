var Backbone = require('backbone');
var _ = require('underscore');

var template = require('../templates/goals.html');

module.exports = Backbone.View.extend({

	className: 'goalsView',

	initialize: function() {
		
	},

	events: {
		
	},

	render: function() {
		this.$el.html( template() );
		return this;
	},

	close: function() {
		this.remove();
		this.unbind();
		this.stopListening();
	}

});