var moment = require('moment');
var datepicker = require('booty-datepicker');
var Backbone = require('backbone');
var template = require('../templates/transactionEditor.html');
var Transaction = require('../models/Transaction');
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
		
		var defaultOptions = {
			RAW_FORMAT: 'YYYY-MM-DD',
			INPUT_FORMATS: ['DD/MM/YYYY'],
			DISPLAY_FORMAT: 'DD/MM/YYYY',
			formatter: function (value) {
				return moment(value, this.RAW_FORMAT, true).format(this.DISPLAY_FORMAT);
			},
			validate: function (value) {
				return moment(value, this.INPUT_FORMATS, true).isValid();
			},
			parser: function (value) {
				return moment(value, this.INPUT_FORMATS, true).format(this.RAW_FORMAT);
			}
		};
		datepicker(defaultOptions);

		this.resetForm();

		return this;
	},

	events: {
		'click .add-entry' : 'addEntry',
		'click .hide-add-entry' : 'hide'
	},

	hide: function(event) {
		if (event) event.preventDefault();
		this.$el.slideUp();
		this.parent.$el.find('.new-transaction button').removeClass('selected');
	},

	show: function() {
		this.renderCategories();
		this.$el.slideDown();
	},

	addEntry: function() {
		
		var entryData = {};

		entryData.positive = this.parent.hasPositiveEntrySelected();
		entryData.amount = this.$el.find('input[name=amount]').val();
		entryData.dateEntry = moment( this.$el.find('input[name=dateEntry]').val(), 'DD-MM-YYYY' ).toDate();
		entryData.description = this.$el.find('input[name=description]').val();

		var selectedCategories = this.categories.where({selected:true});
		if (selectedCategories.length>1) throw "Errore, due categorie selezionate!";
		entryData.category = selectedCategories[0].get('_id');

		// this.collection.create( entryData, {wait:true} );
		var newEntry = new Transaction();

		var _this = this;
		newEntry.save( entryData, {
			wait:true,
			success: function(model, response) {
				_this.resetForm();
				_this.collection.fetch({reset:true});
			},
			error: function(model, response) {
				alert("Errore salvataggio transazione. Riprovare più tardi!");
			}
		});

		this.hide();
	},

	renderCategories: function() {
		var showPositiveCategories = this.parent.hasPositiveEntrySelected();
		this.clearCategorySubviews();
		this.categories.each(function(item) {
			if ( item.get('positive')==showPositiveCategories ) {
				var c = new CategoryItemView( item );
				this.categorySubviews.push( c );
				this.$el.find('.category-items').append( c.render().el );	
			}
		}, this);
	},

	clearCategorySubviews: function() {
		this.categorySubviews.forEach(function(v) {
			if (v.close) v.close();
		});
		this.categorySubviews = [];
	},

	resetForm: function() {
		this.$el.find('.form-group input').val('');
		this.$el.find('.form-group input[name=dateEntry]').val(moment().format('DD/MM/YYYY'));
	}, 

	close: function() {
		this.clearCategorySubviews();
		this.remove();
		this.unbind();
		this.stopListening();
	}

});