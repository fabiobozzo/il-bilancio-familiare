var Backbone 	= require('backbone');
var Period = require('../../models/report/Period');
var ApplicationState = require('../../models/ApplicationState');
 
module.exports = Backbone.Collection.extend({
	
	model: Period,

	url: '/api/report/periods',

	initialize: function(options) {

		this.total = options.total || false;

		this.updateCurrentPeriod();
		this.listenTo( ApplicationState, 'change:currentPeriod', this.updateCurrentPeriod );	
	},

	updateCurrentPeriod: function() {
		this.month = parseInt(ApplicationState.get('currentPeriod').getMonth()) +1;
		this.year = parseInt(ApplicationState.get('currentPeriod').getFullYear());
	},

	refetch: function() {

		var data = {
			t: this.total,
			y: this.year
		};

		if (ApplicationState.get('periodMonthEnabled')) {
			data.m = this.month;
		}

		this.fetch({
			reset:true,
			data: data
		});
	}

});