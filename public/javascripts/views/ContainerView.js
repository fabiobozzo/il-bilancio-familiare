var Backbone = require('backbone');
var ApplicationState = require('../models/ApplicationState');

var views = {};
views['transazioni'] = require('./TransactionView');
 
module.exports = Backbone.View.extend({

	el: '#containerView', 

	initialize: function() {
		this.listenTo( ApplicationState, 'change', this.render );	
		this.render();
	},

	render: function() {
		
		if (this.innerView) {
			this.innerView.close();
		}

		var innerHtml = '';
		if ( views.hasOwnProperty(ApplicationState.get('currentView')) ) {
			this.innerView = new views[ApplicationState.get('currentView')];
			innerHtml = this.innerView.render().el;
		}

		this.$el.html( innerHtml );
		return this;
	},

	close: function() {
		this.remove();
		this.unbind();
		this.stopListening();
		if (this.innerView) {
			this.innerView.close();
		}
	}

});