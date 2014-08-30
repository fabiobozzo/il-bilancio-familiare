var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var categorySchema = mongoose.Schema({

	code 			: { type:String, required:true }, 
	title           : { type:String, required:true }, 
	positive		: { type:Boolean, default:false }, 

});

module.exports = mongoose.model('Category', categorySchema);