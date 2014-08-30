var Backbone 	= require('backbone');
var Transaction = require('../models/Transaction')
 
module.exports = Backbone.Collection.extend({
	model: Transaction,
	url: '/api/transactions'
});