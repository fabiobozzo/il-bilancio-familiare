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
			applicationState:ApplicationState, 
			_:_
		};

		this.$el.html( this.template(templateData) );		
		this.resetForm();

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
	},

	hide: function(event) {
		if (event) event.preventDefault();
		this.$el.slideUp();
	},

	show: function() {
		this.$el.slideDown();
	},

	resetForm: function() {
		this.$el.find('.form-group select').val('');
		
	}, 

	close: function() {
		this.remove();
		this.unbind();
		this.stopListening();
	}

});