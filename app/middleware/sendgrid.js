var sendgrid = require('sendgrid');

module.exports = function() {
    return function(req, res, next) {
        if (process.env.SENDGRID_USERNAME) {
            req.sendgrid = sendgrid(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
        }
        return next();	
    }
};