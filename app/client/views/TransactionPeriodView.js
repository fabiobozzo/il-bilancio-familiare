var moment = require('moment');
var Backbone = require('backbone');
var _ = require('underscore');

var template = require('../templates/transactionPeriod.html');
var Settings = require('../../config/settings');
var ApplicationState = require('../models/ApplicationState');

module.exports = Backbone.View.extend({

	className: 'transactions-period-form', 
	template: template, 

	initialize: function(options) {
		this.closeOnConfirm = options.closeOnConfirm;
		this.showCancelButton = options.showCancelButton;
		this.canDisableMonth = options.canDisableMonth;
	},

	render: function() {
		
		var templateData = {
			settings:Settings, 
			currentMonth: parseInt(ApplicationState.get('currentPeriod').getMonth()),
			currentYear: parseInt(ApplicationState.get('currentPeriod').getFullYear()), 
			showCancelButton: this.showCancelButton,
			canDisableMonth: this.canDisableMonth,
			monthEnabled: ApplicationState.get('periodMonthEnabled'),
			_:_
		};
		this.$el.html( this.template(templateData) );

		return this;
	},

	events: {
		'click .hide-transactions-period' : 'hide',
		'click .confirm-transactions-period' : 'confirm',
		'click .enable-month': 'updateMonthEnabled'
	},

	confirm: function(event) {

		console.log('confirm');

		var year = this.$el.find('select.year').val();
		var month = parseInt(this.$el.find('select.month').val()) +1;
		
		ApplicationState.set('currentPeriod', moment(year+'-'+month+'-01','YYYY-MM-DD').toDate() );

		if ( this.closeOnConfirm ) {
			this.hide();	
		}
		
	},

	updateMonthEnabled: function() {

		ApplicationState.set('periodMonthEnabled', this.$el.find('.enable-month').is(':checked'));
		
		if ( ApplicationState.get('periodMonthEnabled') ) {
			this.$el.find('select.month').removeAttr('disabled');
		} else {
			this.$el.find('select.month').prop('disabled',true);
		}
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
	}

});