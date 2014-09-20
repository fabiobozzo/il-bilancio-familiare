var $ = window.$ = window.jQuery = require('jquery');
var bootstrap = require('../bower_components/bootstrap/dist/js/bootstrap.min.js');

$(function() {
	
	$('body').scrollspy({
		target: '.navbar-fixed-top'
	});
	
	$('.navbar-collapse ul li a').click(function() {
		$('.navbar-toggle:visible').trigger('click');
	});
	
	$('.toggleSignin').click(function(event) {
		event.preventDefault();
		$('.signin-toggle-area').toggleClass('showing');
		$('#signin .alert').hide();
	});
	
	$(window).on('resize load', function() {
		viewportheight = $(window).height();
		headerheight = $('nav.navbar').height();
		$('.full-height').css({'min-height': (viewportheight)-(headerheight) });
	});

});