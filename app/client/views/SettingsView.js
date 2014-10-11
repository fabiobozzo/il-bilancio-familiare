var Backbone = require('backbone');
var _ = require('underscore');

var template = require('../templates/settings.html');
var Transaction = require('../models/Transaction');
var ApplicationState = require('../models/ApplicationState');
var TransactionBalance = require('../models/TransactionBalance');

module.exports = Backbone.View.extend({

	className: 'settingsView',

	initialize: function() {
		
		_.bindAll(this, 'balanceSetSuccess');
		_.bindAll(this, 'balanceSetError');
	},

	events: {
		'click .set-balance button': 'setInitialBalance'
	},

	render: function() {
		this.$el.html( template() );
		return this;
	},

	setInitialBalance: function() {

		var balance = this.$el.find('.set-balance input[name=balance]').val();
		if ( isNaN(balance) || balance<=0 ) {
			alert('Inserire un saldo iniziale valido.');
			return;
		}

		var entryData = {};
		entryData.correction = true;
		entryData.description = 'INITIALBALANCE';
		entryData.amount = parseFloat(balance) - parseFloat(TransactionBalance.get('balance'));
		entryData.positive = entryData.amount > 0;
		entryData.dateEntry = new Date();

		var newEntry = new Transaction();
		newEntry.save( entryData, {
			wait:true,
			success: this.balanceSetSuccess,
			error: this.balanceSetError
		});
	},

	balanceSetSuccess: function() {
		this.$el.find('.set-balance').html('Grazie. Il saldo è stato inizializzato');
	},

	balanceSetError: function() {
		alert('Errore inizializzazione saldo.');
	},

	close: function() {
		this.remove();
		this.unbind();
		this.stopListening();
	}

});