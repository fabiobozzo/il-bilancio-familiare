var Transaction = require('../models/transaction');
var Category = require('../models/category');
var Settings = require('../config/settings');

var moment = require('moment');
var async = require('async');

exports.getTransactions = function( params, callback ) {

	var search = { user:params.uid };
	var options = { sort: {dateEntry: -1}, skip: (params.page-1) * params.limit, limit: params.limit+1 };

	switch (params.filter) {
		case 'positive': search.positive = true; break;
		case 'negative': search.positive = false; break;
	}

	search.dateEntry = { 
		$gte: moment(parseInt(params.dateFrom)), 
		$lte: moment(parseInt(params.dateTo))
	};

	if (params.description) {
		search.description = {
			$regex: new RegExp(params.description, 'i')
		}
	}

	if (params.category) {
		search.category = params.category;
	}

	Transaction
		.find( search, null, options)
		.populate('category')
		.exec( function(err, transactions) {
			if (err) {
				callback({error:err.message});
			}
			var result = {
				transactions: transactions,
				hasNextPage: transactions.length > Settings.TRANSACTIONS_PER_PAGE
			};
			if (result.hasNextPage) {
				result.transactions.pop();
			}
			callback(result);
			
	});

};

exports.saveTransaction = function( transaction, uid, callback ) {
	var t = new Transaction( transaction );
	t.dateAdded = new Date();
	t.user = uid;
	t.save(function(err) {
		if (err) {
			return callback({error:err.message});
		}
		callback(t);
	});
};

exports.deleteTransaction = function( id, callback ) {
	Transaction.findByIdAndRemove(id, function (err,transaction) {
		callback(true);
	});
};

exports.getBalance = function( params, callback ) {

	var matcher = { user:params.uid };
	if ( params.atDate ) {
		matcher.dateEntry = { $lt: params.atDate };
	}

	async.parallel({
		balance: function(cb) {
			Transaction.aggregate(
				[
					{ $match: matcher },
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
				], cb
			);
		}, 
		hasInitial: function(cb) {
			Transaction.findOne( {correction:true}, function(err,transaction) {
				cb(err, (transaction!=null) );
			});
		}
	}, function(err,results) {
		if (err) callback({error:err.message});
		
		callback({ 
			balance: (results.balance.length>0) ? results.balance[0].total : 0, 
			hasInitial: results.hasInitial
		});
	});
};

exports.getCategories = function( callback ) {
	Category.find( {}, null, {sort: {title: 1} }, function(err, categories) {
		if (err) return callback({error:err.message});
		callback(categories);
	});
};
