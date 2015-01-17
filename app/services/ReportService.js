var Transaction = require('../models/transaction');
var Settings = require('../config/settings');

var moment = require('moment');
var async = require('async');

exports.getCategoriesByMonth = function( params, callback ) {

	params.dateRange = { 
		$gte: moment([params.year, params.month - 1]).toDate(), 
		$lte: moment([params.year, params.month - 1]).endOf('month').toDate()
	};

	return getCategories( params, callback );
};

exports.getCategoriesByYear = function( params, callback ) {

	params.dateRange = { 
		$gte: moment([params.year, 0]).toDate(), 
		$lte: moment([params.year, 11]).endOf('month').toDate()
	};

	return getCategories( params, callback );
};

exports.getAmountByPeriod = function( params, callback ) {

	var search = { user:params.uid };
	search.dateEntry = getDateRangeForPeriod( params.year, params.month );

	var grouper = getGrouperForPeriod( params.year, params.month, params.total );
	var projection = getProjectionForPeriod( params.year, params.month, params.total );

	Transaction.aggregate(
		[
			{ $match: search },
			{ $group: grouper },
			{ $project: projection }
		], 
		function(err, results) {
			if (err) return callback({error:err.message});
			callback(getPeriodDataFromAggregationResult( results, params.year, params.month, params.total ));
		}
	);

};

var getCategories = function( params, callback ) {

	var categories = [];
	var search = { user:params.uid, positive:params.positive, dateEntry:params.dateRange };

	Transaction.aggregate(
		[
		{ $match: search },
		{ $group: {_id:"$category", total:{$sum:"$amount"}} },
		{ $project: {_id:false, category:"$_id", total:1} }

		], function(err, results) {
			if (err) callback({error:err.message});

			var globalTotal = 0.0;
			results.forEach(function(i) {
				globalTotal += i.total;
			});

			async.each( results, function(doc, cb) {
				Transaction.populate( doc, { path:'category', select:'title _id' }, function(err, populated) {
					categories.push({
						_id: populated.category._id,
						name: populated.category.title,
						y: populated.total * 100 / globalTotal
					});
					cb(err);
				});
			}, function(err) {
				if (err) callback({error:err.message});
				callback(categories);
			});
			
		}
		);
};

var getDateRangeForPeriod = function( year, month ) {
	if (month) {
		return { 
			$gte: moment([year, month - 1]).toDate(), 
			$lte: moment([year, month - 1]).endOf('month').toDate()
		};
	} else {
		return { 
			$gte: moment([year, 0]).toDate(), 
			$lte: moment([year, 11]).endOf('month').toDate()
		};
	}
};

var getGrouperForPeriod = function( year, month, total ) {

	var grouper = {
		_id: {
			y: {$year:"$dateEntry"},
			m: {$month:"$dateEntry"}
		},
		utcDate: { $max: "$dateEntry"}
	};

	if (month) {
		grouper._id.d = {$dayOfMonth:"$dateEntry"};
	}

	if (total) {
		grouper.total = { $sum: { $cond: [ "$positive", "$amount", { "$subtract": [ 0, "$amount" ] } ] } };
	} else {
		grouper.totalIn = { $sum: { $cond: [ "$positive", "$amount", 0 ] } };
		grouper.totalOut = { $sum: { $cond: [ "$positive", 0, "$amount" ] } };  
	}

	return grouper;
};

var getProjectionForPeriod = function( year, month, total ) {

	var projection = {
		y:"$_id.y", 
		m:"$_id.m", 
		utcDate:1
	};

	if (month) {
		projection.d = "$_id.d";
	}

	if (total) {
		projection.total = 1;
	} else {
		projection.totalIn = 1;
		projection.totalOut = 1;
	}

	return projection;
};

var getPeriodDataFromAggregationResult = function( result, year, month, total) {

	var data = [];
	var dataIn = [];
	var dataOut = [];
	var ret;

	var periodCount = month ? new Date(year, month, 0).getDate() : 12;

	for ( var i = 0; i < periodCount; i++ ) {
		data[i] = 0;
		dataIn[i] = 0;
		dataOut[i] = 0;
		result.forEach(function(ar) {
			if ( parseInt(moment(ar.utcDate).format( month ? 'D' : 'M' )) === (i+1) ) {
				if (total) {
					data[i] = ar.total;
				} else {
					dataIn[i] = ar.totalIn;
					dataOut[i] = ar.totalOut;	
				}
			}
		});
	}

	if (total) {
		ret = [{ name: 'Saldo', data:data }];
	} else {
		ret = [
			{ name: 'Entrate', color:'#00AA00', data:dataIn },
			{ name: 'Uscite', color:'#FF0000', data:dataOut },
		];
	}

	console.log(ret);

	return ret;
};
