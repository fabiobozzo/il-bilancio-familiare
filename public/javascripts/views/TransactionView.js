var moment = require('moment');
var Backbone = require('backbone');
var template = require('../templates/transactions.html');
var TransactionCollection = require('../collections/Transactions');
var TransactionRowView = require('./TransactionRowView');

module.exports = Backbone.View.extend({

	className: 'transactionView',

	initialize: function() {
		
		this.collection = new TransactionCollection();
		this.collection.fetch({ reset:true });
		this.listenTo( this.collection, 'reset', this.render );
		this.listenTo( this.collection, 'add', this.render );
		
		this.rowViews = [];
		this.render();
	},


	render: function() {
		this.rowViews = [];
		this.$el.html( template() );
		this.collection.each(function(item) {
			this.renderEntry(item);
		}, this);
		return this;
	},

	renderEntry: function( entry ) {
		var row = new TransactionRowView( entry );
		this.rowViews.push( row );
		this.$el.find('.entry-list').prepend( row.render().el );
	},

	events: {
		'click .new-transaction button': 'showAddEntryForm',
		'click .add-entry' : 'addEntry'
	},

	showAddEntryForm: function(event) {
		console.log(event.currentTarget);
		this.$el.find('.add-entry-form').slideDown();
		this.$el.find('.new-transaction button').removeClass('selected');
		$(event.currentTarget).addClass('selected');
	},

	addEntry: function() {
		
		var entryData = {};
		var form = this.$el.find('.add-entry-form');

		entryData.positive = this.$el.find('.new-transaction button.selected').hasClass('add-positive-entry');
		entryData.amount = $(form).find('input[name=amount]').val();
		entryData.dateEntry = moment( $(form).find('input[name=dateEntry]').val(), 'DD-MM-YYYY' ).toDate();
		entryData.description = $(form).find('textarea[name=description]').val();

		console.log(entryData);
		this.collection.create( entryData );
	},

	close: function() {

		this.rowViews.forEach(function(v) {
			if (v.close) v.close();
		});
		this.rowViews = [];

		this.remove();
		this.unbind();
		this.stopListening();
	}

});