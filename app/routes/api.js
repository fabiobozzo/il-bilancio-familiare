var express 	= require('express');
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
			var search = { user:req.user._id };
			var options = { sort: {dateEntry: -1}, skip: (page-1) * limit, limit: limit+1 };

			switch (filter) {
				case 'positive': search.positive = true; break;
				case 'negative': search.positive = false; break;
			}
			
			Transaction
				.find( search, null, options)
				.populate('category')
				.exec( function(err, results) {
					if (err) {
						return res.json({error:err.message});
					}
					var hasNextPage = results.length > TRANSACTIONS_PER_PAGE;
					if (hasNextPage) {
						results.pop();
					}
					res.json({
						hasNextPage: hasNextPage,
						transactions: results
					});
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