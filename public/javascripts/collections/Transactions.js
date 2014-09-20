var Backbone 	= require('backbone');
var Transaction = require('../models/Transaction')
 
var TransactionCollection = Backbone.Collection.extend({
	
	model: Transaction,
	
	url: '/api/transactions',
	
	initialize: function() {
		this.hasNextPage = false;
	},

	parse: function(response) {
		this.hasNextPage = response.hasNextPage;
		this.balance = response.balance;
		return response.transactions || [];
	}

});

console.log("Creating TransactionCollection");
module.exports = new TransactionCollection();