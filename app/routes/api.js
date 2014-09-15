var express 	= require('express');
var Transaction = require('../models/transaction');
var Category = require('../models/category');

module.exports = function(app) {

	var router = express.Router();

	router.route('/transactions')
		.get(function(req, res) {
			Transaction.find( {user:req.user._id}, null, {sort: {dateEntry: -1} }, function(err, transactions) {
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

	router.route('/categories')
		.get(function(req, res) {
			Category.find( {}, null, {sort: {title: 1} }, function(err, categories) {
				if (err) {
					return res.json({error:err.message});
				}
				res.json(categories);
			});
		})

	app.use('/api',router);

};