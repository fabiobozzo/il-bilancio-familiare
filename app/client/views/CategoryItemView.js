var Backbone = require('backbone');
var template = require('../templates/categoryItem.html');

module.exports = Backbone.View.extend({

	tagName: 'li',
	className: 'category-item',
	template: template, 

	initialize: function(model) {
		this.model = model;
		this.listenTo( this.model, 'change', this.update );
	},

	events: {
		'click .category-link': 'select'
	},

	select: function() {
		var thisId = this.model.get('_id');
		this.model.collection.each(function(item) {
			item.set( 'selected', item.get('_id') == thisId );
		});
	},

	update: function() {
		this.$el.removeClass('selected');
		if (this.model.get('selected')) this.$el.addClass('selected');
	},

	render: function() {
		this.$el.html( this.template(this.model.toJSON()) );
		this.update();
		return this;
	},

	close: function() {
		this.model.set('selected',false);
		this.remove();
		this.unbind();
		this.stopListening();
	}

});