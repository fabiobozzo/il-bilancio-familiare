var Backbone 	= require('backbone');
var Period = require('../../models/report/Period');
var ApplicationState = require('../../models/ApplicationState');
var moment = require('moment');
 
module.exports = Backbone.Collection.extend({
	
	model: Period,

	url: '/api/report/periods',

	initialize: function(options) {

		this.total = options.total || false;

		this.updateCurrentPeriod();
		this.listenTo( ApplicationState, 'change:currentPeriod', this.updateCurrentPeriod );	
	},

	updateCurrentPeriod: function() {
		var cp = moment(ApplicationState.get('currentPeriod')).toDate();
		this.month = parseInt(cp.getMonth()) +1;
		this.year = parseInt(cp.getFullYear());
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