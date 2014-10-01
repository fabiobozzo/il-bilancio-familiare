var Backbone = require('backbone');
var _ = require('underscore');
var moment = require('moment');

var template = require('../templates/transactions.html');
var templateGroupHeader = require('../templates/transactionsHeader.html');
var TransactionBalance = require('../models/TransactionBalance');
var TransactionCollection = require('../collections/Transactions');
var TransactionItemView = require('./TransactionItem');
var TransactionEditorView = require('./TransactionEditor');
var TransactionPeriodView = require('./TransactionPeriod');
var Settings = require('../../config/settings');
var ApplicationState = require('../models/ApplicationState');

module.exports = Backbone.View.extend({

	className: 'transactionView',

	initialize: function() {
		
		this.collection = TransactionCollection;		
		this.listenTo( this.collection, 'reset', this.renderFirstPage );
		this.listenTo( this.collection, 'add', this.renderRow );
		this.listenTo( TransactionBalance, 'sync', this.updateBalance );
		this.listenTo( ApplicationState, 'change:currentPeriod', this.updateCurrentPeriod );	

		this.rowViews = [];
		this.displayDay = '';

		this.render();
		_.bindAll(this, 'setMoreEntriesVisibility');
		
		this.collection.refetch();
	},

	events: {
		'click .new-transaction button': 'showAddEntryForm',
		'click .more-entries': 'renderNextPage',
		'click .filters .type button': 'filter',
		'click .period-chooser': 'showPeriodChooser'
	},

	render: function() {
		
		this.$el.html( template() );

		this.editorView = new TransactionEditorView({
			collection: this.collection, 
			parent: this
		});
		this.$el.find('.new-transaction').after( this.editorView.render().el );

		this.periodChooserView = new TransactionPeriodView({
			collection: this.collection, 
			parent: this
		});
		this.$el.find('.controls-container').after( this.periodChooserView.render().el );

		this.renderFirstPage();
		this.updateCurrentPeriod();
		
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
		TransactionBalance.fetch();
	},

	renderNextPage: function() {
		this.collection.fetchNextPage(this.setMoreEntriesVisibility);
	},

	clearEntryRows: function() {
		this.rowViews.forEach(function(v) {
			if (v.close) v.close();
		});
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

	updateBalance: function(model) {
		this.$el.find('.balance .balance-value').text(model.get('balance'));
	}, 

	updateCurrentPeriod: function() {
		var month = Settings.monthsFull[ ApplicationState.get('currentPeriod').getMonth() ];
		var year = ApplicationState.get('currentPeriod').getFullYear();
		this.$el.find('.period-chooser .text').html( month + ' ' + year );
		this.periodChooserView.hide();
		this.collection.refetch();
	},

	showAddEntryForm: function(event) {
		event.preventDefault();
		
		this.$el.find('.new-transaction button').removeClass('selected');
		$(event.currentTarget).addClass('selected');
		
		this.periodChooserView.hide();
		this.editorView.show();	
	},

	showPeriodChooser: function(event) {
		this.editorView.hide();
		this.periodChooserView.show();		
	},

	hasPositiveEntrySelected: function() {
		return this.$el.find('.new-transaction button.selected').hasClass('add-positive-entry');
	},

	filter: function(event) {
		
		var button = $(event.currentTarget);
		this.collection.filter = button.attr('data-filter') || 'all';
		
		this.$el.find('.filters .type button').removeClass('selected');
		button.addClass('selected');

		this.collection.refetch();

	},

	close: function() {

		this.clearEntryRows();
		this.editorView.close();
		this.periodChooserView.close();

		this.remove();
		this.unbind();
		this.stopListening();
	}

});