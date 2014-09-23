var Backbone = require('backbone');
var _ = require('underscore');
var moment = require('moment');

var template = require('../templates/transactions.html');
var templateGroupHeader = require('../templates/transactionsHeader.html');
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
		this.displayDay = '';

		this.render();
		_.bindAll(this, 'setMoreEntriesVisibility');
		
		this.collection.fetch({ reset:true });
	},

	events: {
		'click .new-transaction button': 'showAddEntryForm',
		'click .more-entries': 'renderNextPage',
		'click .filters .type button': 'filter'
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
		var day = moment(model.get('dateEntry')).format('DD/MM/YYYY')
		if ( day!=this.displayDay ) {
			this.displayDay = day;
			this.$el.find('.entry-list').append(templateGroupHeader( {displayDay:day} ));
		}
		var row = new TransactionItemView( model );
		this.rowViews.push( row );
		this.$el.find('.entry-list').append( row.render().el );
	},

	renderFirstPage: function() {
		this.displayDay = '';
		this.clearEntryRows();
		this.collection.each(function(item) {
			this.renderRow(item);
		}, this);
		this.setMoreEntriesVisibility();
		this.updateBalance();
	},

	renderNextPage: function() {
		this.page++;
		this.collection.fetch({ 
			add: true, 
			data: {
				p: this.page,
				filter: this.collection.filter
			}, 
			success: this.setMoreEntriesVisibility
		});
	},

	clearEntryRows: function() {
		this.rowViews.forEach(function(v) {
			if (v.close) v.close();
		});
		this.page = 1;
		this.rowViews = [];
		this.$el.find('.entry-list').html('');
	},

	setMoreEntriesVisibility: function() {
		if (this.collection.hasNextPage) {
			this.$el.find('.more-entries').show();
		} else {
			this.$el.find('.more-entries').hide();
		}
	}, 

	updateBalance: function() {
		this.$el.find('.balance .balance-value').text(this.collection.balance);
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

	filter: function(event) {
		
		var button = $(event.currentTarget);
		this.collection.filter = button.attr('data-filter') || 'all';
		
		this.$el.find('.filters .type button').removeClass('selected');
		button.addClass('selected');
		
		this.collection.fetch({
			reset:true,
			data: {
				filter: this.collection.filter
			}
		});

	},

	close: function() {

		this.clearEntryRows();
		this.editorView.close();

		this.remove();
		this.unbind();
		this.stopListening();
	}

});