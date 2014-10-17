var express = require('express');
var moment = require('moment');
var async = require('async');

var Transaction = require('../models/transaction');
var Category = require('../models/category');
var Settings = require('../config/settings');

module.exports = function(app) {

	var router = express.Router();

	router.route('/transactions')
		.get(function(req, res) {
			
			var limit = req.query.limit || Settings.TRANSACTIONS_PER_PAGE;
			var page = req.query.p || 1;
			var filter = req.query.filter || '';
			var month = req.query.m || parseInt((new Date()).getMonth())+1;
			var year = req.query.y || parseInt((new Date()).getFullYear());
			
			var search = { user:req.user._id, correction:false };
			var options = { sort: {dateEntry: -1}, skip: (page-1) * limit, limit: limit+1 };

			switch (filter) {
				case 'positive': search.positive = true; break;
				case 'negative': search.positive = false; break;
			}

			search.dateEntry = { 
				$gte: moment([year, month - 1]), 
				$lte: moment([year, month - 1]).endOf('month')
			};

			Transaction
				.find( search, null, options)
				.populate('category')
				.exec( function(err, transactions) {
					if (err) {
						return res.json({error:err.message});
					}
					var result = {
						transactions: transactions,
						hasNextPage: transactions.length > Settings.TRANSACTIONS_PER_PAGE
					};
					if (result.hasNextPage) {
						result.transactions.pop();
					}
					res.json(result);
					
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

	router.route('/transactions/balance')
		.get(function(req,res) {
			async.parallel({
				balance: function(callback) {
					Transaction.aggregate(
						[
							{ $match: { user:req.user._id } },
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
						], callback
					);
				}, 
				hasInitial: function(callback) {
					Transaction.findOne( {correction:true}, function(err,transaction) {
						callback(err, (transaction!=null) );
					});
				}
			}, function(err,results) {
				if (err) {
					return res.json({error:err.message});
				}
				res.json({ 
					balance: (results.balance.length>0) ? results.balance[0].total : 0, 
					hasInitial: results.hasInitial
				});
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
		});

	router.route('/testmail')
		.get(function(req, res) {
			if (req.sendgrid) {
				sendgrid.send({
					to: 'fabio.bozzo@gmail.com',
					from: 'test@ilbilanciofamiliare.it',
					subject: 'Test',
					text: 'E-mail da Heroku! Bravo!'
				}, function(err, json) {
					if (err) { 
						res.json(err); 
						return;
					}
					res.json(json);
				});
			} else {
				res.json({error:'Sendgrid not available'});
			}
		});

	app.use('/api',router);

};