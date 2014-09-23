var Backbone = require('backbone');
 
module.exports = Backbone.Model.extend({
	idAttribute: '_id',
	defaults: {
		id: 0,
		description: '',	
		amount: 0,
		dateEntry: new Date(),
		positive: false
	},
	url: '/api/transactions'
});