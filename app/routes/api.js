var express = require('express');
var async = require('async');

var Transaction = require('../models/transaction');
var Category = require('../models/category');

var TRANSACTIONS_PER_PAGE = 3;

module.exports = function(app) {

	var router = express.Router();

	router.route('/transactions')
		.get(function(req, res) {
			
			var limit = req.query.limit || TRANSACTIONS_PER_PAGE;
			var page = req.query.p || 1;
			var filter = req.query.filter || '';
			var baseSearch = search = { user:req.user._id };
			var options = { sort: {dateEntry: -1}, skip: (page-1) * limit, limit: limit+1 };

			switch (filter) {
				case 'positive': search.positive = true; break;
				case 'negative': search.positive = false; break;
			}
			
			async.parallel({
				transactions: function(callback) {
					Transaction
						.find( search, null, options)
						.populate('category')
						.exec( function(err, transactions) {
							callback(err,transactions);
					});
				},
				balance: function(callback) {
					Transaction.aggregate(
						[
							{ "$group": {
								"_id": null,
								"total": {
									"$sum": {
										"$cond": [
											"$positive",
											"$amount",
											{ "$subtract": [ 0, "$amount" ] }
										]
									}
								}
							}}
						],
						function(err,result) {
							callback(err,result);
						}
					)
				}
			}, function(err, results) {
				if (err) {
					return res.json({error:err.message});
				}
				results.hasNextPage = results.transactions.length > TRANSACTIONS_PER_PAGE;
				if (results.hasNextPage) {
					results.transactions.pop();
				}
				results.balance = results.balance[0].total;
				res.json(results);
			});

		})
		.post(function(req,res) {
			var t = new Transaction( req.body );
			t.dateAdded = new Date();
			t.user = req.user._id;
			t.save(function(err) {
				if (err) {
					return res.json({error:err.message});
				}
				res.json(t);
			});
		});

	router.route('/transactions/:id')
		.delete(function(req,res) {
			Transaction.findByIdAndRemove(req.params.id, function (err,transaction) {
				res.json(true);
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