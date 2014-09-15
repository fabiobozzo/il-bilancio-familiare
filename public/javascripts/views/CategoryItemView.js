var Backbone = require('backbone');
var template = require('../templates/categoryItem.html');

module.exports = Backbone.View.extend({

	tagName: 'li',
	className: 'category-item',
	template: template, 

	initialize: function(model) {
		this.model = model;
	},

	render: function() {
		this.$el.html( this.template(this.model.toJSON()) );
		return this;
	},

	close: function() {
		this.remove();
		this.unbind();
		this.stopListening();
	}

});