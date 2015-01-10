var moment = require('moment');
var Transaction = require('../models/transaction');

module.exports = function(app) {

	app.get('/', function(req, res){
		if ( req.isAuthenticated() ) {
			res.render('app', {
				title: '',
				user: req.user
			}); 
		} else {
			res.render('index', { 
				title: 'Benvenuti!', 
				message: req.flash('signinMessage') 
			});	
		}
	});

	app.get('/export/csv', function(req, res){
		res.setHeader("Content-Type", "text/csv");

		var search = { user:req.user._id };
		var options = { sort: {dateEntry: -1} };
		var stream = Transaction.find( search, null, options).populate('category').stream();

		res.write('descrizione;importo;categoria;tipo;data\n');

		stream.on('data', function (doc) {
			res.write( 
				doc.description + ';' + 
				doc.amount + ';' + 
				doc.category.title + ';' + 
				(doc.positive?'entrata':'uscita') + ';' + 
				moment(doc.dateEntry).format('DD/MM/YYYY') + '\n'
			);
		}).on('error', function (err) {
			res.statusCode = 500;
			return res.end('Errore esportazione CSV.');
		}).on('close', function () {
			return res.end();
		});

	});	

	app.get('/export/json', function(req, res){
		res.setHeader("Content-Type", "application/json");

		var search = { user:req.user._id };
		var options = { sort: {dateEntry: -1} };
		var stream = Transaction.find( search, null, options).populate('category').stream();
		
		var first = true;
		res.write('[');

		stream.on('data', function (doc) {
			res.write( (first?'':',') + JSON.stringify(doc));
			first = false;
		}).on('error', function (err) {
			res.statusCode = 500;
			return res.end({error:'Errore esportazione JSON'});
		}).on('close', function () {
			res.write(']');
			return res.end();
		});

	});	

};