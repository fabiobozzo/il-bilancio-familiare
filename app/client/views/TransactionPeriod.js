var moment = require('moment');
var Backbone = require('backbone');
var _ = require('underscore');

var template = require('../templates/transactionPeriod.html');
var Transaction = require('../models/Transaction');
var Settings = require('../../config/settings');
var ApplicationState = require('../models/ApplicationState');

module.exports = Backbone.View.extend({

	className: 'transactions-period-form', 
	template: template, 

	initialize: function(options) {

		this.collection = options.collection;
		this.parent = options.parent;
	},

	render: function() {
		
		var templateData = {
			settings:Settings, 
			currentMonth: parseInt(ApplicationState.get('currentPeriod').getMonth()),
			currentYear: parseInt(ApplicationState.get('currentPeriod').getFullYear()), 
			_:_
		};
		this.$el.html( this.template(templateData) );		

		return this;
	},

	events: {
		'click .hide-transactions-period' : 'hide',
		'click .confirm-transactions-period' : 'confirm'
	},

	confirm: function(event) {
		var year = this.$el.find('select.year').val();
		var month = parseInt(this.$el.find('select.month').val()) +1;
		ApplicationState.set('currentPeriod', moment(year+'-'+month+'-01','YYYY-MM-DD').toDate() );
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
	}

});