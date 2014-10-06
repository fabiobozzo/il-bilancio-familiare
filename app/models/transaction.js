var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var transactionSchema = mongoose.Schema({

	description     : String,
	amount          : { type:Number, min:0.01, required:true }, 
	dateEntry       : { type:Date, default:Date.now }, 
	dateAdded       : { type:Date, default:Date.now }, 
	positive		: { type:Boolean, default:false }, 
	correction		: { type:Boolean, default:false }, 

	category        : { type: ObjectId, ref: 'Category' },
	user 	      	: { type: ObjectId, ref: 'User' }

});

module.exports = mongoose.model('Transaction', transactionSchema);