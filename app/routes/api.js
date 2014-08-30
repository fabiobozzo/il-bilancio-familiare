var express 	= require('express');
var Transaction = require('../models/transaction');

module.exports = function(app) {

	var router = express.Router();

	router.route('/transactions')
		.get(function(req, res) {
			Transaction.find( function(err, transactions) {
				if (err) {
					return res.json({error:err});
				}
				res.json(transactions);
			});
		})
		.post(function(req,res) {
			console.log(req.body);
			res.send('ok');
		});

	app.use('/api',router);

};