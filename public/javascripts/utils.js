exports.parseItalianDate = function(dateString) {
	// expects 22/06/2014 -> returns Date object for [22 Jun 2014]
	var parts = dateString.split('-');
	var month = (parts[0] * 1 ) - 1; 
	var day   = parts[1];
	var year  = parts[2];
	var d = new Date();
	d.setMonth(month);
	d.setDate(day);
	d.setFullYear(year);
	return d;
};