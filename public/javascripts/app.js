var $ = window.$ = window.jQuery = require('jquery');
var bootstrap = require('../bower_components/bootstrap/dist/js/bootstrap.min.js');
var Backbone = require('backbone');
Backbone.$ = $;
Backbone.LocalStorage = require("backbone.localstorage");

var MenuView = require('./views/MenuView');
var ContainerView = require('./views/ContainerView');
var ApplicationState = require('./models/ApplicationState');

ApplicationState.fetch();

new MenuView();
new ContainerView();
