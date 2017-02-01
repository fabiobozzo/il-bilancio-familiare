var Backbone 	= require('backbone');
var Transaction = require('../models/Transaction');
var ApplicationState = require('../models/ApplicationState');
var moment = require('moment');
 
var TransactionCollection = Backbone.Collection.extend({
	
	model: Transaction,
	
	url: '/api/transactions',
	
	initialize: function() {
		
		this.hasNextPage = false;
		this.filter = 'all';
		this.page = 1;
		this.updateCurrentPeriod();
		this.updateCurrentSearch();

		this.listenTo( ApplicationState, 'change:currentPeriod', this.updateCurrentPeriod );
		this.listenTo( ApplicationState, 'change:currentSearch', this.updateCurrentSearch );
	},

	parse: function(response) {
		this.hasNextPage = response.hasNextPage;
		this.balance = response.balance;
		return response.transactions || [];
	},

	refetch: function() {
		this.page = 1;
		this.fetch({
			reset:true,
			data: {
				filter: this.filter, 
				p: this.page, 
				// m: this.month, 
				// y: this.year
				df: this.df,
				dt: this.dt,
				d: this.d, 
				c: this.c
			}
		});
	},

	fetchNextPage: function(callback) {
		this.page++;
		this.fetch({ 
			add: true, 
			data: {
				filter: this.filter, 
				p: this.page, 
				// m: this.month, 
				// y: this.year
				df: this.df,
				dt: this.dt,
				d: this.d, 
				c: this.c
			}, 
			success: callback
		});
	},

	updateCurrentPeriod: function() {
		var cp = moment(ApplicationState.get('currentPeriod')).toDate();
		console.log(cp);
		this.month = parseInt(cp.getMonth()) +1;
		this.year = parseInt(cp.getFullYear());
	},

	updateCurrentSearch: function() {
		this.df = ApplicationState.get('currentSearch').from;
		this.dt = ApplicationState.get('currentSearch').to;
		this.d = ApplicationState.get('currentSearch').description;
		this.c = ApplicationState.get('currentSearch').category;
	}

});

module.exports = new TransactionCollection();
console.log("new TransactionCollection");