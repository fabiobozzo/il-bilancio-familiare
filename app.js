var path          = require('path');
var express         = require('express');
var app             = express();
var port            = process.env.PORT || 3000;

var passport        = require('passport');
var flash           = require('connect-flash');
var morgan          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var session         = require('express-session');

var passportMw		= require('./app/middleware/passport');
var authentication  = require('./app/middleware/authentication');
var sendgrid		= require('./app/middleware/sendgrid');

var authRoutes      = require('./app/routes/auth');
var appRoutes       = require('./app/routes/app');
var apiRoutes       = require('./app/routes/api');

var mongoose        = require('mongoose');
var User            = require('./app/models/user');
var seeder 			= require('./app/config/seeder');

// var mongoUri        = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/bilancio';
var mongoUri        = process.env.MONGODB_URI || 'mongodb://localhost/bilancio';

mongoose.connect(mongoUri, function(err) {
	if (err) throw err;	
	console.log('Connected to MongoDB at: ' + mongoUri);
	seeder.seed(function(initialized) {
		if (initialized) {
			console.log('DB initialized.');
		}
	});
}); 

passportMw(passport,User);

app.set('views', __dirname + '/app/views/');
app.set('view engine', 'jade'); 
app.use(morgan('dev')); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); 
app.use(session({ secret: 'caffenoamazon', resave:true, saveUninitialized:true })); 
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash()); 
app.use(authentication());
app.use(sendgrid());

authRoutes(app, passport); 
appRoutes(app); 
apiRoutes(app); 

app.listen(port);
console.log('App listening on port: ' + port);
