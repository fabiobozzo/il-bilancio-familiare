var moment = require('moment');
var Backbone = require('backbone');
var _ = require('underscore');

require('jquery');
require('pickadate');

var template = require('../templates/transactionEditor.html');
var Transaction = require('../models/Transaction');
var CategoryCollection = require('../collections/Categories');
var CategoryItemView = require('../views/CategoryItemView');
var Settings = require('../../config/settings');

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
		_.bindAll(this, 'addEntry');
		_.bindAll(this, 'validateEntryData');
		_.bindAll(this, 'openDatePicker');
	},

	render: function() {
		
		this.$el.html( this.template() );
		
		this.resetForm();

		this.$datepicker = this.$el.find('.form-group input[name=dateEntry]').pickadate({
			monthsFull: Settings.monthsFull,
			monthsShort: Settings.monthsShort,
			weekdaysFull: Settings.weekdaysFull,
			weekdaysShort: Settings.weekdaysShort,
			today: 'Oggi',
			clear: 'Reset',
			close: 'Chiudi',
			format: 'dd/mm/yyyy',
			formatSubmit: 'yyyy-mm-dd',
			hiddenPrefix: 'prefix__',
			hiddenSuffix: '__suffix',
			hiddenName: 'pickadate-hidden-field',
			firstDay: 1,
			editable: false
		});

		this.$datepicker.pickadate('picker').on('open' , function(){console.log('picker opened');});

		return this;
	},

	events: {
		'click .add-entry' : 'addEntry',
		'click .hide-add-entry' : 'hide',
		'click .entry-date-icon': 'openDatePicker'
	},

	hide: function(event) {
		if (event) event.preventDefault();
		this.$el.slideUp();
		this.parent.$el.find('.new-transaction button').removeClass('selected');
	},

	show: function() {
		this.updateCategories();
		this.$el.slideDown();
		this.$el.find('.entryAmountKind').html( this.parent.isPositiveEntrySelected() ? '+' : '-' );
	},

	addEntry: function() {
		
		var entryData = {};

		entryData.positive = this.parent.isPositiveEntrySelected();
		entryData.amount = this.$el.find('input[name=amount]').val().trim();
		entryData._dateEntry = this.$el.find('input[name=dateEntry]').val().trim();
		entryData.dateEntry = moment( entryData._dateEntry, 'DD-MM-YYYY', true ).toDate();
		entryData.description = this.$el.find('input[name=description]').val().trim();

		var selectedCategories = this.categories.where({selected:true});
		entryData.category = selectedCategories.length>0 ? selectedCategories[0].get('_id') : '';

		var validation = this.validateEntryData(entryData);

		if ( !validation.success ) {

			alert(validation.message);
			if ( validation.domNode ) { 
				validation.domNode.focus();
			}

		} else {

			var newEntry = new Transaction();
			newEntry.save( entryData, {
				wait:true,
				success: this.entryAdded,
				error: this.entryAddError
			});

			this.disableAddEntryButton();
		}
	},

	validateEntryData: function(data) {
		
		var result = { success: true };
		if ( isNaN(data.amount) ) {
			result.success = false;
			result.message = 'Inserire un importo numerico';
			result.domNode = this.$el.find('input[name=amount]');
			return result;
		}
		if ( data.amount <= 0 ) {
			result.success = false;
			result.message = 'Inserire un importo numerico positivo (senza segno)';
			result.domNode = this.$el.find('input[name=amount]');
			return result;	
		}
		if ( data.category === '' ) {
			result.success = false;
			result.message = 'Selezionare una categoria';
			return result;	
		}
		if ( data._dateEntry === '' ) {
			result.success = false;
			result.message = 'Inserire una data valida';
			result.domNode = this.$el.find('input[name=dateEntry]');
			return result;	
		} 
		return result;
	},

	entryAdded: function(model, response) {
		this.resetForm();
		this.collection.refetch();
		this.hide();
		this.enableAddEntryButton();
	},

	entryAddError: function(model, response) {
		this.enableAddEntryButton();
		alert("Errore salvataggio transazione. Riprovare più tardi!");
	},

	enableAddEntryButton: function() {
		var button = this.$el.find('.add-entry');
		button.removeProp('disabled').removeAttr('disabled').text( button.attr('data-text') );
	},

	disableAddEntryButton: function() {
		var button = this.$el.find('.add-entry');
		button.prop('disabled', 'true').text( 'Attendere...' );
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
		var showPositiveCategories = this.parent.isPositiveEntrySelected();
		this.categorySubviews.forEach(function(v) {
			if ( v.model.get('positive')==showPositiveCategories ) { 
				v.$el.show();
			} else {
				v.$el.hide();
			}
			v.model.set( 'selected', false );
		});
	},

	openDatePicker: function(event) {
		
		var picker = this.$datepicker.pickadate('picker');
		console.log(picker);
		picker.open(false);
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