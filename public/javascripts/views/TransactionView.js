var Backbone = require('backbone');
var template = require('../templates/transactions.html');
var TransactionCollection = require('../collections/Transactions');

module.exports = Backbone.View.extend({

	className: 'transactionView',

	initialize: function() {
		
		this.collection = new TransactionCollection();
		this.collection.fetch({ reset:true });
		this.listenTo( this.collection, 'reset', this.render );
		
		this.render();
	},


	render: function() {
		this.$el.html( template() );
		return this;
	},

	events: {
		'click .new-transaction button': 'showAddEntryForm'
	},

	showAddEntryForm: function() {
		this.$el.find('.add-entry-form').slideDown();
	},

	close: function() {
		this.remove();
		this.unbind();
		this.stopListening();
	}

});