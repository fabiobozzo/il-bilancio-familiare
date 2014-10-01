var Backbone 	= require('backbone');
var Transaction = require('../models/Transaction');
var ApplicationState = require('../models/ApplicationState');
 
var TransactionCollection = Backbone.Collection.extend({
	
	model: Transaction,
	
	url: '/api/transactions',
	
	initialize: function() {
		
		this.hasNextPage = false;
		this.filter = 'all';
		this.page = 1;
		this.updateCurrentPeriod();

		this.listenTo( ApplicationState, 'change:currentPeriod', this.updateCurrentPeriod );	
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
				m: this.month, 
				y: this.year
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
				m: this.month, 
				y: this.year
			}, 
			success: callback
		});
	},

	updateCurrentPeriod: function() {
		this.month = parseInt(ApplicationState.get('currentPeriod').getMonth()) +1;
		this.year = parseInt(ApplicationState.get('currentPeriod').getFullYear());
	}

});

module.exports = new TransactionCollection();
console.log("new TransactionCollection");