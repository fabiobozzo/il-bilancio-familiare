var Backbone = require('backbone');
var ApplicationState = require('../models/ApplicationState');
 
module.exports = Backbone.View.extend({

	el: '#menuView', 

	events: {
		'click li': 'toggleActiveClass',
		'click .menuLink': 'changePage',
		'click .navbar-collapse ul li a': 'slideUpMenu'
	},

	toggleActiveClass: function(event) {
		$('#menuView li').removeClass('active');
		$(event.target).parents('li').addClass('active');
	},

	changePage: function(event) {
		event.preventDefault();
		var viewName = $(event.currentTarget).attr('data-view');
		ApplicationState.set('currentView',viewName);
		ApplicationState.save();
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