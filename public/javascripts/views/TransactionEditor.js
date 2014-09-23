var moment = require('moment');
var Backbone = require('backbone');
var _ = require('underscore');

require('jquery');
require('pickadate');

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

		_.bindAll(this, 'entryAdded');
		_.bindAll(this, 'entryAddError');
	},

	render: function() {
		
		this.$el.html( this.template() );
		
		this.resetForm();

		this.$el.find('.form-group input[name=dateEntry]').pickadate({
			monthsFull: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
			monthsShort: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
			weekdaysFull: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
			weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
			today: 'Oggi',
			clear: 'Reset',
			close: 'Chiudi',
			format: 'dd/mm/yyyy',
			formatSubmit: 'yyyy-mm-dd',
			hiddenPrefix: 'prefix__',
			hiddenSuffix: '__suffix',
			hiddenName: 'pickadate-hidden-field',
			firstDay: 1
		});

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
		this.updateCategories();
		this.$el.slideDown();
	},

	addEntry: function() {
		
		var entryData = {};

		entryData.positive = this.parent.hasPositiveEntrySelected();
		entryData.amount = this.$el.find('input[name=amount]').val();
		entryData.dateEntry = moment( this.$el.find('input[name=dateEntry]').val(), 'DD-MM-YYYY' ).toDate();
		entryData.description = this.$el.find('input[name=description]').val();

		var selectedCategories = this.categories.where({selected:true});
		entryData.category = selectedCategories[0].get('_id');

		var newEntry = new Transaction();

		newEntry.save( entryData, {
			wait:true,
			success: this.entryAdded,
			error: this.entryAddError
		});

		this.hide();
	},

	entryAdded: function(model, response) {
		this.resetForm();
		this.collection.fetch({
			reset: true,
			filter: this.collection.filter 
		});
	},

	entryAddError: function(model, response) {
		alert("Errore salvataggio transazione. Riprovare più tardi!");
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

	updateCategories: function() {
		var showPositiveCategories = this.parent.hasPositiveEntrySelected();
		this.categorySubviews.forEach(function(v) {
			if ( v.model.get('positive')==showPositiveCategories ) { 
				v.$el.show();
			} else {
				v.$el.hide();
			}
		});
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