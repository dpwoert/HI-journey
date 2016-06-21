var fs = require('fs');
var parseCsv = require('dank-csv');
var geocoder = require('geocoder');
var q = require('q');

var data = fs.readFileSync(__dirname + '/hyper.csv');
var csv = parseCsv(data.toString('utf8'));
var promises = [];

csv.forEach(function(person){

	var cities = person['before_hyper'].replace('; ', ';').split(';');
	person.before = [];

	cities.forEach(function(city){

		var defer = q.defer();
		promises.push(defer.promise);

		geocoder.geocode(city, function ( err, data ) {

			person.before.push({
				location: data.results[0].geometry.location,
				name: data.results[0].address_components[0].long_name
			});

			console.log(person['first_name'] + ':' + data.results[0].address_components[0].long_name)

			defer.resolve();

		});

	});

});

q
	.all(promises)
	.then(function(){

		console.log('done building data')

		var data = JSON.stringify(csv);
		fs.writeFileSync( __dirname + '/data.json', data);

	})
