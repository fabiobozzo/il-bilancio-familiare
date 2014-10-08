var moment = require('moment');

module.exports = function(app) {

	app.get('/', function(req, res){
		if ( req.isAuthenticated() ) {
			res.render('app', {
				title: ''
			}); 
		} else {
			res.render('index', { 
				title: 'Benvenuti!', 
				testdate: moment('2014-09-01','YYYY-MM-DD').toDate(),
				message: req.flash('signinMessage') 
			});	
		}
	});

};