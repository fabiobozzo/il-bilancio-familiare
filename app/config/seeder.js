var Category = require('../models/category');

var categories = [

	{ code: 'goods', title:'Spesa', positive:false },
	{ code: 'shopping', title:'Shopping', positive:false },
	{ code: 'food', title:'Ristorazione', positive:false },
	{ code: 'transport', title:'Trasporti', positive:false },
	{ code: 'bills', title:'Bollette', positive:false },
	{ code: 'selfcare', title:'Persona', positive:false },
	{ code: 'entertainment', title:'Svago', positive:false },
	{ code: 'car', title:'Auto', positive:false },
	{ code: 'gift-out', title:'Regali', positive:false },
	{ code: 'pets', title:'Animali', positive:false },
	{ code: 'health', title:'Salute', positive:false },
	{ code: 'home', title:'Casa', positive:false },
	{ code: 'travel', title:'Viaggi', positive:false },
	{ code: 'family', title:'Famiglia', positive:false },
	{ code: 'services', title:'Servizi', positive:false },
	{ code: 'other-out', title:'Altro', positive:false },

	{ code: 'wage', title:'Stipendio', positive:true },
	{ code: 'gift-in', title:'Regali', positive:true },
	{ code: 'invoice', title:'Fatture', positive:true },
	{ code: 'refund', title:'Rimborsi', positive:true },
	{ code: 'income', title:'Rendite', positive:true },
	{ code: 'inheritance', title:'Eredità', positive:true },
	{ code: 'winning', title:'Vincite', positive:true },
	{ code: 'other-in', title:'Altro', positive:true }

];

exports.seed = function(callback) {
	var initialized = false;
	Category.find(function(err,results) {
		if (err) {
			console.log(err);
			return callback(false);
		}
		if (!results.length) {
			Category.create(categories, function(err) {
				if (err) {
					console.log(err);
					return callback(false);
				}
				return callback(true);
			});
		}
	});
};