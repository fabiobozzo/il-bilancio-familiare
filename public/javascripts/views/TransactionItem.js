var moment = require('moment');
var _ = require('underscore');
var Backbone = require('backbone');
var template = require('../templates/transactionItem.html');

module.exports = Backbone.View.extend({

	tagName: 'div',
	className: 'row entryRow',
	template: template, 

	initialize: function(model) {
		this.model = model;
	},

	render: function() {
		var data = _.extend( this.model.toJSON(), {moment:moment} );
		this.$el.html( this.template(data) );
		return this;
	},

	close: function() {
		this.remove();
		this.unbind();
		this.stopListening();
	}

});