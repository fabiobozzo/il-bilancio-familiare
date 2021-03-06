var Backbone = require('backbone');
var ApplicationState = require('../models/ApplicationState');

var views = {};
views['transazioni'] = require('./TransactionView');
views['impostazioni'] = require('./SettingsView');
views['statistiche'] = require('./ReportView');
views['obiettivi'] = require('./GoalsView');
 
module.exports = Backbone.View.extend({

	el: '#containerView', 

	initialize: function() {
		this.listenTo( ApplicationState, 'change:currentView', this.render );	
		this.render();
	},

	render: function() {
		
		if (this.innerView) {
			this.innerView.close();
		}

		var innerHtml = '';
		if ( views.hasOwnProperty(ApplicationState.get('currentView')) ) {
			this.innerView = new views[ApplicationState.get('currentView')]();
			innerHtml = this.innerView.render().el;
		}

		this.$el.html( innerHtml );
		return this;
	},

	close: function() {
		if (this.innerView) {
			this.innerView.close();
		}
		this.remove();
		this.unbind();
		this.stopListening();
	}

});