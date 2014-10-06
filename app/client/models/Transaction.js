var Backbone = require('backbone');
 
module.exports = Backbone.Model.extend({
	idAttribute: '_id',
	defaults: {
		description: '',	
		amount: 0,
		dateEntry: new Date(),
		positive: false,
		correction: false
	},
	urlRoot: '/api/transactions'
});