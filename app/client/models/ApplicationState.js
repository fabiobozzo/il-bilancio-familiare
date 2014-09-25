var Backbone = require('backbone');
var moment = require('moment');

var ApplicationState = Backbone.Model.extend({
	defaults: {
		id: 1,
		currentView: 'transazioni', 
		currentPeriod: moment().toDate(), 
		positiveEntry: false
	},
	localStorage: new Backbone.LocalStorage('application-state'),
});

console.log("Creating ApplicationState");
module.exports = new ApplicationState();