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
		'click .set-balance button': 'setInitialBalance',
		'click .change-password button': 'changePassword'
	},

	render: function() {
		this.$el.html( template({username:window.username||''}) );
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
		entryData.description = 'SALDO INIZIALE';
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

	changePassword: function() {

		var pw = $.trim( this.$el.find('.change-password input[name=password]').val() || '' );
		var confirmPw = $.trim( this.$el.find('.change-password input[name=confirm]').val() || '' );

		if ( pw!=confirmPw ) {
			alert('Le password non corrispondono');
		} else {
			$.ajax({
				type: 'POST',
				url: '/api/password',
				data: { password: pw },
				success: function(data){
					alert( data.success ? 'Password re-impostata.' : 'Errore.' );
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					alert('Errore. Si prega di riprovare più tardi');
				}
			});
		}

		this.$el.find('.change-password input[name=password]').val('').focus();
		this.$el.find('.change-password input[name=confirm]').val('');

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