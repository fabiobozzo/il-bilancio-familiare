var Backbone = require('backbone');
var _ = require('underscore');
var template = require('../templates/transactions.html');
var TransactionCollection = require('../collections/Transactions');
var TransactionItemView = require('./TransactionItem');
var TransactionEditorView = require('./TransactionEditor');

module.exports = Backbone.View.extend({

	className: 'transactionView',

	initialize: function() {
		
		this.collection = TransactionCollection;		
		this.listenTo( this.collection, 'reset', this.renderFirstPage );
		this.listenTo( this.collection, 'add', this.renderRow );

		this.page = 1;
		this.rowViews = [];
		this.render();
		_.bindAll(this, 'setMoreEntriesVisibility');
		this.collection.fetch({ reset:true });

	},

	events: {
		'click .new-transaction button': 'showAddEntryForm',
		'click .more-entries': 'renderNextPage'
	},

	render: function() {
		
		this.$el.html( template() );

		this.editorView = new TransactionEditorView({
			collection: this.collection, 
			parent: this
		});
		this.$el.find('.new-transaction').after( this.editorView.render().el );

		this.renderFirstPage();
		
		return this;
	},

	renderRow: function(model) {
		var row = new TransactionItemView( model );
		this.rowViews.push( row );
		this.$el.find('.entry-list').append( row.render().el );
	},

	renderFirstPage: function() {
		this.clearEntryRows();
		this.collection.each(function(item) {
			this.renderRow(item);
		}, this);
		this.setMoreEntriesVisibility();
	},

	renderNextPage: function() {
		this.page++;
		this.collection.fetch({ 
			add: true, 
			remove: false, 
			merge: false, 
			data: {
				p: this.page
			}, 
			success: this.setMoreEntriesVisibility
		});
	},

	clearEntryRows: function() {
		this.rowViews.forEach(function(v) {
			if (v.close) v.close();
		});
		this.rowViews = [];
	},

	setMoreEntriesVisibility: function() {
		if (this.collection.hasNextPage) {
			this.$el.find('.more-entries').show();
		} else {
			this.$el.find('.more-entries').hide();
		}
	},

	showAddEntryForm: function(event) {
		event.preventDefault();
		
		this.$el.find('.new-transaction button').removeClass('selected');
		$(event.currentTarget).addClass('selected');
		
		this.editorView.show();	
	},

	hasPositiveEntrySelected: function() {
		return this.$el.find('.new-transaction button.selected').hasClass('add-positive-entry');
	},

	close: function() {

		this.clearEntryRows();
		this.editorView.close();

		this.remove();
		this.unbind();
		this.stopListening();
	}

});