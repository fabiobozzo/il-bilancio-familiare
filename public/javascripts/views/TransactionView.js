var Backbone = require('backbone');
var template = require('../templates/transactions.html');
var TransactionCollection = require('../collections/Transactions');
var TransactionItemView = require('./TransactionItem');
var TransactionEditorView = require('./TransactionEditor');

module.exports = Backbone.View.extend({

	className: 'transactionView',

	initialize: function() {
		
		this.collection = TransactionCollection;
		this.fetch();
		
		this.listenTo( this.collection, 'reset', this.renderEntries );
		this.listenTo( this.collection, 'add', this.fetch );
		
		this.rowViews = [];
		this.render();
	},

	fetch: function() { 
		this.collection.fetch({ reset:true });
	},

	render: function() {
		
		this.$el.html( template() );

		this.editorView = new TransactionEditorView({
			collection: this.collection, 
			parent: this
		});
		this.$el.find('.new-transaction').after( this.editorView.render().el );

		this.renderEntries();
		
		return this;
	},

	renderEntries: function() {
		this.clearEntryRows();
		this.collection.each(function(item) {
			var row = new TransactionItemView( item );
			this.rowViews.push( row );
			this.$el.find('.entry-list').append( row.render().el );
		}, this);
	},

	events: {
		'click .new-transaction button': 'showAddEntryForm'
	},

	showAddEntryForm: function(event) {
		event.preventDefault();
		
		this.$el.find('.new-transaction button').removeClass('selected');
		$(event.currentTarget).addClass('selected');
		
		this.editorView.show();	
	},

	clearEntryRows: function() {
		this.rowViews.forEach(function(v) {
			if (v.close) v.close();
		});
		this.rowViews = [];
	},

	close: function() {

		this.clearEntryRows();
		this.editorView.close();

		this.remove();
		this.unbind();
		this.stopListening();
	}

});