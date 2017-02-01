var Backbone = require('backbone');
var moment = require('moment');

var defaults = {
	id: 1,
	currentView: 'transazioni', 
	currentPeriod: moment().valueOf(),
	currentSearch: {
		from: moment().startOf('month').valueOf(),
		to: moment().endOf('day').valueOf(),
		description: '',
		category: ''
	},
	periodMonthEnabled: true
};

var ApplicationState = Backbone.Model.extend({
	defaults: defaults,
	fetch: function() {
		console.log("ApplicationState fetched");
		this.set(JSON.parse(localStorage.getItem(this.id)));
	},
	save: function(attributes) {
		console.log("ApplicationState saved");
		localStorage.setItem(this.id, JSON.stringify(this.toJSON()));
	},
	destroy: function(options) {
		console.log("ApplicationState destroyed");
		localStorage.removeItem(this.id);
	},
	isEmpty: function() {
		return (_.size(this.attributes) <= 1); // just 'id'
	}
	// ,localStorage: new Backbone.LocalStorage('application-state')
});

module.exports = new ApplicationState(defaults);

console.log("new ApplicationState");