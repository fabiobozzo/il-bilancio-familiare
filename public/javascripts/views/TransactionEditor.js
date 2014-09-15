var moment = require('moment');
var Backbone = require('backbone');
var template = require('../templates/transactionEditor.html');
var CategoryCollection = require('../collections/Categories');
var CategoryItemView = require('../views/CategoryItemView');

module.exports = Backbone.View.extend({

	className: 'add-entry-form', 
	template: template, 

	initialize: function(options) {

		this.collection = options.collection;
		this.parent = options.parent;

		this.categorySubviews = [];
		this.categories = new CategoryCollection();
		this.listenTo( this.categories, 'reset', this.renderCategories );
		this.categories.fetch({reset:true});
	},

	render: function() {
		this.$el.html( this.template() );
		return this;
	},

	events: {
		'click .add-entry' : 'addEntry',
		'click .hide-add-entry' : 'hide'
	},

	hide: function(event) {
		event.preventDefault();
		this.$el.slideUp();
		this.parent.$el.find('.new-transaction button').removeClass('selected');
	},

	show: function() {
		this.$el.slideDown();
	},

	addEntry: function() {
		
		var entryData = {};

		entryData.positive = this.parent.$el.find('.new-transaction button.selected').hasClass('add-positive-entry');
		entryData.amount = this.$el.find('input[name=amount]').val();
		entryData.dateEntry = moment( this.$el.find('input[name=dateEntry]').val(), 'DD-MM-YYYY' ).toDate();
		entryData.description = this.$el.find('textarea[name=description]').val();

		this.collection.create( entryData, {wait:true} );
		this.hide();
	},

	renderCategories: function() {
		this.clearCategorySubviews();
		this.categories.each(function(item) {
			var c = new CategoryItemView( item );
			this.categorySubviews.push( c );
			this.$el.find('.category-items').append( c.render().el );
		}, this);
	},

	clearCategorySubviews: function() {
		this.categorySubviews.forEach(function(v) {
			if (v.close) v.close();
		});
		this.categorySubviews = [];
	},

	close: function() {
		this.clearCategorySubviews();
		this.remove();
		this.unbind();
		this.stopListening();
	}

});