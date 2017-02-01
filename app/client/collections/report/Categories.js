var Backbone 	= require('backbone');
var Category = require('../../models/report/Category');
var ApplicationState = require('../../models/ApplicationState');
var moment = require('moment');
 
module.exports = Backbone.Collection.extend({
	
	model: Category,

	url: '/api/report/categories',

	initialize: function(options) {

		this.positive = options.positive || false;

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
			p: this.positive,
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