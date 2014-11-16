var User = require('../models/user');

module.exports = function(app,passport) {

	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/', 
		failureRedirect : '/#signin', 
		failureFlash : true 
	}));

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/pending', 
		failureRedirect : '/#signin', 
		failureFlash : true 
	}));

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/#signin');
	});

	app.get('/auth/facebook', passport.authenticate('facebook', { 
		scope : 'email' 
	}));

	app.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect : '/',
		failureRedirect : '/#signin'
	}));

	app.get('/auth/twitter', passport.authenticate('twitter'));

	app.get('/auth/twitter/callback', passport.authenticate('twitter', {
		successRedirect : '/',
		failureRedirect : '/#signin'
	}));

	app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    app.get('/auth/google/callback', passport.authenticate('google', {
        successRedirect : '/',
        failureRedirect : '/#signin'
    }));

    app.get('/pending', function(req,res) {
    	req.logout();
    	res.render('pending', {
			title: 'In attesa di conferma registrazione...'
		}); 
    });

	app.get('/confirm', function(req,res) {
		if (req.query.id) {
			console.log("Searching "+req.query.id);
			User.findOne({ '_id' :  req.query.id }, function(err, user) {
				if (err) throw err;
				if (user) {
					console.log(user);
					user.active = true;
					user.save(function(err) {
						if (err) throw err;
						res.render('confirm', {
							title: 'Conferma registrazione'
						}); 
					});
				}
			});
		} else {
			res.redirect('/#signin');	
		}
    });

};