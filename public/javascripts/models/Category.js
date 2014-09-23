var Backbone = require('backbone');
 
module.exports = Backbone.Model.extend({
	idAttribute: '_id',
	defaults: {
		id: 0,
		code: '',	
		title: '',
		positive: false, 
		selected: false
	}
});