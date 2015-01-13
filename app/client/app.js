var $ = window.$ = window.jQuery = require('jquery');
var bootstrap = require('bootstrap');
var Backbone = require('backbone');
Backbone.$ = $;
Backbone.LocalStorage = require("backbone.localstorage");
var numeral = require('numeral');

numeral.language('it', {
	delimiters: {
		thousands: '.',
		decimal: ','
	},
	abbreviations: {
		thousand: 'k',
		million: 'm',
		billion: 'b',
		trillion: 't'
	},
	ordinal : function (number) {
		return number;
	},
	currency: {
		symbol: '€'
	}
});
numeral.language('it');

var MenuView = require('./views/MenuView');
var ContainerView = require('./views/ContainerView');
var ApplicationState = require('./models/ApplicationState');

$(function() {

	ApplicationState.fetch();

	new MenuView();
	new ContainerView();

	$('[rel=tooltip]').tooltip();

});