var Backbone = require('backbone');
 
var ApplicationState = Backbone.Model.extend({
	defaults: {
		id: 1,
		currentView: 'transazioni'
	},
	localStorage: new Backbone.LocalStorage('application-state'),
});

module.exports = new ApplicationState();