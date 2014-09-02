var Backbone = require('backbone');
 
module.exports = Backbone.Model.extend({
	defaults: {
		description: '',	
		amount: 0,
		dateEntry: new Date(),
		positive: false
	}
});