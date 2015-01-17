var User = require('../models/user');

exports.changePassword = function( uid, password, callback ) {

	if ( password.length==0 ) {
		return callback({error:'La password non può essere vuota.'});
	}

	User.findOne({ _id: uid }, function(err, user) {
		
		if (err) return callback({error:err.message});
		
		if ( !user.local ) {
			user.local = {};
		}

		user.local.password = user.generateHash(password);
		
		user.save(function(err) {
			if (err) return callback({error:err.message});
			callback({success:true});
		});

	});

};

exports.confirmUser = function( uid, callback ) {

	User.findOne({ '_id' :  uid }, function(err, user) {
		if (err) throw err;
		if (user) {
			user.active = true;
			user.save(function(err) {
				if (err) throw err;
				callback(user);
			});
		}
	});
	
};