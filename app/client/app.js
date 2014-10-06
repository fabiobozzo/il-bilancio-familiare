var $ = window.$ = window.jQuery = require('jquery');
var bootstrap = require('bootstrap');
var Backbone = require('backbone');
Backbone.$ = $;
Backbone.LocalStorage = require("backbone.localstorage");

var MenuView = require('./views/MenuView');
var ContainerView = require('./views/ContainerView');
var ApplicationState = require('./models/ApplicationState');

$(function() {

	ApplicationState.fetch();

	new MenuView();
	new ContainerView();

	$('[rel=tooltip]').tooltip();

});