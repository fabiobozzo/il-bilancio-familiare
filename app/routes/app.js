module.exports = function(app) {

	app.get('/', function(req, res){
		if ( req.isAuthenticated() ) {
			res.render('app', {
				title: ''
			}); 
		} else {
			res.render('index', { 
				title: 'Benvenuti!', 
				message: req.flash('signinMessage') 
			});	
		}
	});

};