var moment = require('moment');
var Backbone = require('backbone');
var _ = require('underscore');

var template = require('../templates/transactionSearch.html');
var Settings = require('../../config/settings');
var ApplicationState = require('../models/ApplicationState');
var CategoryCollection = require('../collections/Categories');

module.exports = Backbone.View.extend({

	className: 'transactions-search-form', 
	template: template, 

	initialize: function(options) {

		this.categories = new CategoryCollection();
		this.listenTo( this.categories, 'reset', this.renderCategories );
		this.categories.fetch({reset:true});

		_.bindAll(this, 'openDatePicker');
		_.bindAll(this, 'renderCategories');
	},

	render: function() {
		
		var templateData = {
			settings:Settings, 
			dateFrom: moment(ApplicationState.get('currentSearch').from).format('DD/MM/YYYY'),
			dateTo: moment(ApplicationState.get('currentSearch').to).format('DD/MM/YYYY'),
			description: ApplicationState.get('currentSearch').description,
			_:_
		};
		this.$el.html( this.template(templateData) );

		var pickadateOpts = {
			monthsFull: Settings.monthsFull,
			monthsShort: Settings.monthsShort,
			weekdaysFull: Settings.weekdaysFull,
			weekdaysShort: Settings.weekdaysShort,
			today: 'Oggi',
			clear: 'Reset',
			close: 'Chiudi',
			format: 'dd/mm/yyyy',
			formatSubmit: 'yyyy-mm-dd',
			firstDay: 1,
			editable: false
		};

		var dateInputFrom = this.$el.find('input[name=dateFrom]');
		this.$datepickerFrom = $(dateInputFrom).pickadate(pickadateOpts);

		var dateInputTo = this.$el.find('input[name=dateTo]');
		this.$datepickerTo = $(dateInputTo).pickadate(pickadateOpts);

		return this;
	},

	events: {
		'click .hide-transactions-search' : 'hide',
		'click .confirm-transactions-search' : 'confirm',
		'click .entry-date-icon': 'openDatePicker'
	},

	confirm: function(event) {
		console.log('confirm');

		var from = this.$el.find('input[name=dateFrom]').val().trim() || '';
		var to = this.$el.find('input[name=dateTo]').val().trim() || '';
		var description = this.$el.find('input[name=description]').val().trim() || '';
		var category = this.$el.find('select[name=category]').val().trim() || '';

		if ( from!=='' && to!=='' ) {

			from = moment( from, 'DD/MM/YYYY', true );
			to = moment( to, 'DD/MM/YYYY', true );	

			ApplicationState.set('currentSearch', {
				from: from.valueOf(), 
				to:to.valueOf(),
				description: description,
				category: category
			});
			ApplicationState.save();
		}

		this.hide();	
	},

	hide: function(event) {
		if (event) event.preventDefault();
		this.$el.slideUp();
	},

	show: function() {
		this.$el.slideDown();
	},

	close: function() {
		this.remove();
		this.unbind();
		this.stopListening();
	},

	renderCategories: function() {

		var sel = this.$el.find('select[name="category"]');

		sel.append('<optgroup label="Entrate">');
		this.categories.each(function(item) {
			if (item.get('positive')) {
				sel.append(
					'<option value="' + item.get('_id') + '">' + item.get('title') + '</option>'
				);
			}
		}, this);
		sel.append('</optgroup>');

		sel.append('<optgroup label="Uscite">');
		this.categories.each(function(item) {
			if (!item.get('positive')) {
				sel.append(
					'<option value="' + item.get('_id') + '">' + item.get('title') + '</option>'
				);
			}
		}, this);
		sel.append('</optgroup>');
	},

	openDatePicker: function(event) {

		console.log($(event.target));
		var picker;

		if ($(event.target).hasClass('date-from')) {
			picker = this.$datepickerFrom.pickadate('picker');	
			picker.open(false);
		}
		
		if ($(event.target).hasClass('date-to')) {
			picker = this.$datepickerTo.pickadate('picker');	
			picker.open(false);
		}
	}

});