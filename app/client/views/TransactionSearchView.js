var moment = require('moment');
var Backbone = require('backbone');
var _ = require('underscore');

var template = require('../templates/transactionSearch.html');
var Settings = require('../../config/settings');
var ApplicationState = require('../models/ApplicationState');

module.exports = Backbone.View.extend({

	className: 'transactions-search-form', 
	template: template, 

	initialize: function(options) {
		
	},

	render: function() {
		
		var templateData = {
			settings:Settings, 
			_:_
		};
		this.$el.html( this.template(templateData) );

		return this;
	},

	events: {
		'click .hide-transactions-search' : 'hide',
		'click .confirm-transactions-search' : 'confirm'
	},

	confirm: function(event) {
		console.log('confirm');
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