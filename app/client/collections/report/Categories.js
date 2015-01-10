var Backbone 	= require('backbone');
var Category = require('../../models/report/Category');
 
module.exports = Backbone.Collection.extend({
	
	model: Category,
	url: '/api/report/categories',

});