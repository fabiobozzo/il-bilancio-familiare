var moment = require('moment');
var _ = require('underscore');
var Backbone = require('backbone');

var TransactionBalance = require('../models/TransactionBalance');
var template = require('../templates/transactionItem.html');

module.exports = Backbone.View.extend({

	tagName: 'div',
	className: 'row entryRow',
	template: template, 

	initialize: function(model) {
		this.model = model;
		_.bindAll(this, 'delete');
	},

	events: {
		'click .delete button': 'delete'
	},

	render: function() {
		var data = _.extend( this.model.toJSON(), {moment:moment} );
		this.$el.html( this.template(data) );
		return this;
	},

	delete: function() {
		var el = this.$el;
		this.model.destroy({
			success: function() {
				TransactionBalance.fetch();
				el.addClass('deleted');
				el.find('.delete button').hide();
			},
			error: function() {
				alert('Errore. Impossibile eliminare questa transazione.');
			}
		});
	},

	close: function() {
		this.remove();
		this.unbind();
		this.stopListening();
	}

});