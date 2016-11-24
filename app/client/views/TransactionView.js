var Backbone = require('backbone');
var _ = require('underscore');
var moment = require('moment');
var numeral = require('numeral');

var template = require('../templates/transactions.html');
var templateGroupHeader = require('../templates/transactionsHeader.html');
var TransactionBalance = require('../models/TransactionBalance');
var TransactionCollection = require('../collections/Transactions');
var TransactionItemView = require('./TransactionItemView');
var TransactionEditorView = require('./TransactionEditorView');
var TransactionSearchView = require('./TransactionSearchView');
var Settings = require('../../config/settings');
var ApplicationState = require('../models/ApplicationState');
var Vent = require('../utils/EventAggregator');

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
		_.bindAll(this, 'renderRow');
		_.bindAll(this, 'showTransactionsLoader');
		_.bindAll(this, 'showBalanceLoader');
		
		this.collection.refetch();
	},

	events: {
		'click .new-transaction button': 'showAddEntryForm',
		'click .more-entries': 'renderNextPage',
		'click .filters .type button': 'filter',
		'click .search': 'showSearch',
		'click .balance .ask-for-initial-balance': 'goToSetInitialBalance'
	},

	render: function() {
		
		this.$el.html( template() );

		this.editorView = new TransactionEditorView({
			collection: this.collection, 
			parent: this
		});
		this.$el.find('.new-transaction').after( this.editorView.render().el );

		this.searchView = new TransactionSearchView();
		this.$el.find('.controls-container').after( this.searchView.render().el );

		this.updateCurrentPeriod();
		this.showBalanceLoader();
		this.showTransactionsLoader();
		
		return this;
	},

	renderRow: function(model) {
		var day = moment(model.get('dateEntry')).format('DD/MM/YYYY');
		var dayToDisplay = Settings.weekdaysFull[moment(model.get('dateEntry')).format('d')] + ' ' + moment(model.get('dateEntry')).format('D');
		if ( day!=this.displayDay ) {
			this.displayDay = day;
			this.$el.find('.entry-list').append(templateGroupHeader( {displayDay:dayToDisplay} ));
		}
		var row = new TransactionItemView( model,this );
		this.rowViews.push( row );
		this.$el.find('.entry-list').append( row.render().el );
	},

	renderFirstPage: function() {

		this.displayDay = '';
		this.clearEntryRows();

		if ( this.collection.length === 0 ) {

			this.$el.find('.entry-list').html('<hr /><br />Non ci sono movimenti nel mese selezionato.');

		} else {
			this.collection.each(function(item) {
				this.renderRow(item);
			}, this);	
		}
		
		this.setMoreEntriesVisibility();

		this.showBalanceLoader();
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
		if ( model.get('hasInitial')===false ) {
			this.$el.find('.balance .ask-for-initial-balance').show();	
		}

		this.$el.find('.balance .balance-value').text( numeral(model.get('balance')).format('0,0.00') );

		this.$el.find('.balance').removeClass('alert-danger').removeClass('alert-success');
		this.$el.find('.balance').addClass( parseFloat(model.get('balance')) >= 0 ? 'alert-success' : 'alert-danger' );
	}, 

	showBalanceLoader: function() {
		this.$el.find('.controls-container .balance .balance-value').html(Settings.LOADER_GIF_TAG);
	},

	showTransactionsLoader: function() {
		this.$el.find('.entry-list').html(Settings.LOADER_GIF_TAG);
	},

	updateCurrentPeriod: function() {
		var month = Settings.monthsFull[ ApplicationState.get('currentPeriod').getMonth() ];
		var year = ApplicationState.get('currentPeriod').getFullYear();
		this.$el.find('.search .text').html( month + ' ' + year );
		this.searchView.hide();

		this.showTransactionsLoader();
		this.collection.refetch();
	},

	showAddEntryForm: function(event) {
		event.preventDefault();
		
		this.$el.find('.new-transaction button').removeClass('selected');
		$(event.currentTarget).addClass('selected');
		
		this.searchView.hide();
		this.editorView.show();	
	},

	showSearch: function(event) {
		this.editorView.hide();
		this.searchView.show();		
	},

	isPositiveEntrySelected: function() {
		return this.$el.find('.new-transaction button.selected').hasClass('add-positive-entry');
	},

	goToSetInitialBalance: function() {
		Vent.trigger('menu:setbalance');
	},

	filter: function(event) {
		
		var button = $(event.currentTarget);
		this.collection.filter = button.attr('data-filter') || 'all';
		
		this.$el.find('.filters .type button').removeClass('selected');
		button.addClass('selected');

		this.showTransactionsLoader();
		this.collection.refetch();

	},

	close: function() {

		this.clearEntryRows();
		this.editorView.close();
		this.searchView.close();

		this.remove();
		this.unbind();
		this.stopListening();
	}

});