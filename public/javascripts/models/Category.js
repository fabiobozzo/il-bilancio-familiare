var Backbone = require('backbone');
 
module.exports = Backbone.Model.extend({
	defaults: {
		code: '',	
		title: '',
		positive: false, 
		selected: false
	}
});