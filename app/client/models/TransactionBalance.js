var Backbone = require('backbone');
 
var TransactionBalance = Backbone.Model.extend({
	defaults: {
		id: null,
		balance: 0
	},
	url: '/api/transactions/balance'
});

module.exports = new TransactionBalance();