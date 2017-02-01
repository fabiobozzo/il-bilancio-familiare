var express = require('express');

var Settings = require('../config/settings');
var ReportService = require('../services/ReportService');
var TransactionService = require('../services/TransactionService');
var UserService = require('../services/UserService');

module.exports = function(app) {

	var router = express.Router();

	router.route('/transactions')
		.get(function(req, res) {
			
			var params = {
				limit: req.query.limit || Settings.TRANSACTIONS_PER_PAGE,
				page: req.query.p || 1,
				filter: req.query.filter || '',
				// month: req.query.m || parseInt((new Date()).getMonth())+1,
				// year: req.query.y || parseInt((new Date()).getFullYear()),
				dateFrom: req.query.df,
				dateTo: req.query.dt,
				description: req.query.d, 
				category: req.query.c, 
				uid: req.user._id
			};

			TransactionService.getTransactions( params, function(result) {
				res.json(result);
			});

		})
		.post(function(req,res) {
			TransactionService.saveTransaction( req.body, req.user._id, function(result) {
				res.json(result);
			});
		});

	router.route('/transactions/balance')
		.get(function(req,res) {
			TransactionService.getBalance( { uid:req.user._id }, function(result) {
				res.json(result);
			});
		});

	router.route('/transactions/:id')
		.delete(function(req,res) {
			TransactionService.deleteTransaction( req.params.id, function(result) {
				res.json(result);
			});
		});

	router.route('/categories')
		.get(function(req, res) {
			TransactionService.getCategories( function(result) {
				res.json(result);
			});
		});

	router.route('/password')
		.post(function(req, res) {
			var pw = req.body.password || '';
			UserService.changePassword( req.user._id, pw, function(result) {
				res.json(result);
			});
		});

	router.route('/report/categories')
		.get(function(req,res) {

			var positive = req.query.p === 'true' || false;
			var month = req.query.m || false;
			var year = req.query.y || parseInt((new Date()).getFullYear());

			var search = { user:req.user._id, positive:positive };

			if (month) {
				ReportService.getCategoriesByMonth( 
					{ 
						uid:req.user._id, 
						positive:positive, 
						year:year, 
						month:month
					}, 
					function(result) {
						res.json(result);
					}
				);
			} else {
				ReportService.getCategoriesByYear( 
					{ 
						uid:req.user._id, 
						positive:positive, 
						year:year, 
						month:month
					}, 
					function(result) {
						res.json(result);
					}
				);
			}

		});

	router.route('/report/periods')
		.get(function(req,res) {

			var total = req.query.t === 'true' || false;
			var month = req.query.m || false;
			var year = req.query.y || parseInt((new Date()).getFullYear());

			if (!total) {
				ReportService.getAmountByPeriod(
					{
						uid: req.user._id,
						year: year,
						month: month
					}, 
					function( result ) {
						res.json(result);
					}
				);
			} else { 
				ReportService.getBalanceByPeriod(
					{
						uid: req.user._id,
						total: total, 
						year: year,
						month: month
					}, 
					function( result ) {
						res.json(result);
					}
				);
			}
			
		});

	app.use('/api',router);

};