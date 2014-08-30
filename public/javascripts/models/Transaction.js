var Backbone = require('backbone');
 
module.exports = Backbone.Model.extend({
	defaults: {
		description: '',	
		amount: 0,
		date: new Date(),
		positive: false,
		category: 0 
	}
});