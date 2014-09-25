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
		this.model.destroy({
			success: function() {
				TransactionBalance.fetch();
			},
			error: function() {
				alert('Errore. Impossibile eliminare questa transazione.');
			}
		});
		this.close();
	},

	close: function() {
		this.remove();
		this.unbind();
		this.stopListening();
	}

});