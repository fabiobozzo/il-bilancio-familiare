var Backbone 	= require('backbone');
var Category = require('../../models/report/Category');
var ApplicationState = require('../../models/ApplicationState');
 
module.exports = Backbone.Collection.extend({
	
	model: Category,

	url: '/api/report/categories',

	initialize: function(options) {

		this.positive = options.positive || false;

		this.updateCurrentPeriod();
		this.listenTo( ApplicationState, 'change:currentPeriod', this.updateCurrentPeriod );	
	},

	updateCurrentPeriod: function() {
		this.month = parseInt(ApplicationState.get('currentPeriod').getMonth()) +1;
		this.year = parseInt(ApplicationState.get('currentPeriod').getFullYear());
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