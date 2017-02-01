var Backbone = require('backbone');
var _ = require('underscore');

var ApplicationState = require('../models/ApplicationState');
var Vent = require('../utils/EventAggregator');
 
module.exports = Backbone.View.extend({

	el: '#menuView', 

	initialize: function() {
		this.listenTo( Vent, 'menu:setbalance', this.showSettingsViewToSetBalance );
		_.bindAll(this, 'showSettingsViewToSetBalance');
	},

	events: {
		'click .menuLink': 'changePage',
		'click .navbar-collapse ul li a': 'slideUpMenu'
	},

	changePage: function(event) {
		event.preventDefault();

		var viewName = $(event.currentTarget).attr('data-view');
		ApplicationState.set('currentView',viewName);

		ApplicationState.save();

		$('#menuView li').removeClass('active');
		$(event.currentTarget).parents('li').addClass('active');
	},

	showSettingsViewToSetBalance: function() {
		this.$el.find('a.menuLink[data-view=impostazioni]').trigger('click');
		setTimeout(function() {
			$('.set-balance input[name=balance]').focus();
		}, 500);
	},

	slideUpMenu: function(event) {
		$('.navbar-toggle:visible').trigger('click');
	},

	close: function() {
		this.remove();
		this.unbind();
		this.stopListening();
	}

});