var Backbone 	= require('backbone');
var Category = require('../models/Category');
 
module.exports = Backbone.Collection.extend({
	model: Category,
	url: '/api/categories'
});