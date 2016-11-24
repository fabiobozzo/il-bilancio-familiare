var $ = window.$ = window.jQuery = require('jquery');
var bootstrap = require('bootstrap');

$(function() {
	
	$('.toggleSignin').click(function(event) {
		event.preventDefault();
		$('.signin-toggle-area').toggleClass('showing');
		$('#signin .alert').hide();
	});

	localStorage.clear();

});