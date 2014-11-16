var publicPaths = [
	'/login',
	'/logout',
    '/confirm',
    '/pending',
	'/signup',
    '/auth/facebook',
    '/auth/twitter',
    '/auth/google',
    '/auth/facebook/callback',
    '/auth/twitter/callback',
    '/auth/google/callback',
	'/'
];

var apiPath = '/api';

module.exports = function() {
    return function(req, res, next) {
    	if ( publicPaths.indexOf(req.path)>=0 || req.isAuthenticated() ) {
            res.locals.user = req.user || {};
    		return next();	
    	} else if ( req.path.indexOf(apiPath)>=0 ) {
            res.statusCode = 401;
            res.json({error:'unauthorized'});
        } else { 
    		res.redirect('/#signin');
    	}
    }
};