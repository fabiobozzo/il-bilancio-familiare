var Backbone 	= require('backbone');
var Transaction = require('../models/Transaction')
 
var TransactionCollection = Backbone.Collection.extend({
	model: Transaction,
	url: '/api/transactions'
});

console.log("Creating TransactionCollection");
module.exports = new TransactionCollection();