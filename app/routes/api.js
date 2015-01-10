var express = require('express');
var moment = require('moment');
var async = require('async');

var Transaction = require('../models/transaction');
var Category = require('../models/category');
var User = require('../models/user');
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
			
			var search = { user:req.user._id };
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

	router.route('/password')
		.post(function(req, res) {
			
			var pw = req.body.password || '';

			if ( pw.length==0 ) {
				return res.json({error:'La password non può essere vuota.'});
			}

			User.findOne({ _id: req.user._id }, function(err, user) {
				if (err) {
					return res.json({error:err.message});
				}
				if ( !user.local ) {
					user.local = {};
				}
				user.local.password = user.generateHash(pw);
				user.save(function(err) {
					if (err) {
						return res.json({error:err.message});
					}
					res.json({success:true});
				})
			});
			
		});

	router.route('/report/categories')
		.get(function(req,res) {

			var positive = req.query.positive === 'true' || false;

			Transaction.aggregate(
				[
					{ $match: { user:req.user._id, positive: positive } },
					{ $group: {_id:"$category", total:{$sum:"$amount"}}},
					{ $project: {_id:false, category:"$_id", total:1}}

				], function(err, results) {
					if (err) return res.json({error:err.message});

					var ret = [];

					var globalTotal = 0.0;
					results.forEach(function(i) {
						globalTotal += i.total;
					});

					async.each( results, function(doc, callback) {
						Transaction.populate( doc, { path:'category', select:'title _id' }, function(err, populated) {
							ret.push({
								_id: populated.category._id,
								name: populated.category.title,
								y: populated.total * 100 / globalTotal
							});
							callback(err);
						});
					}, function(err) {
						if (err) return res.json({error:err.message});
						res.json(ret);
					});
					
				}
			);

		});

	app.use('/api',router);

};