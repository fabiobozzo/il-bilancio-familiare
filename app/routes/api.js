var express 	= require('express');
var Transaction = require('../models/transaction');

module.exports = function(app) {

	var router = express.Router();

	router.route('/transactions')
		.get(function(req, res) {
			Transaction.find( {user:req.user._id}, function(err, transactions) {
				if (err) {
					return res.json({error:err.message});
				}
				res.json(transactions);
			});
		})
		.post(function(req,res) {
			var t = new Transaction( req.body );
			t.dateAdded = new Date();
			t.user = req.user._id;
			t.save(function(err) {
				if (err) {
					console.error("Error saving transaction:: ",err);
					return res.json({error:err.message});
				}
				res.json(t);
			});
		});

	app.use('/api',router);

};