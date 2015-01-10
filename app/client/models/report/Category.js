var Backbone = require('backbone');
 
module.exports = Backbone.Model.extend({
	
	idAttribute: '_id',
	
	defaults: {
		name: '',	
		y: 0.0
	}

});