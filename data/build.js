var fs = require('fs');
var parseCsv = require('dank-csv');
var geocoder = require('geocoder');
var q = require('q');

var data = fs.readFileSync(__dirname + '/hyper.csv');
var csv = parseCsv(data.toString('utf8'));
var promises = [];

csv.forEach(function(person){

	var cities = person['before_hyper'].replace('; ', ';').split(';');
	var cities2 = person['after_hyper'].replace('; ', ';').split(';');
	person.before = [];
	person.after = [];

	cities.forEach(function(city){

		var defer = q.defer();
		promises.push(defer.promise);

		setTimeout(function(){

			geocoder.geocode(city, function ( err, data ) {

				if(data.results.length === 0 || !data.results[0].geometry){
					console.log('not found:' +  city + ' for: ' + person['first_name']);
					return false
				}

				person.before.push({
					location: data.results[0].geometry.location,
					name: data.results[0].address_components[0].long_name
				});

				console.log(person['first_name'] + ':' + data.results[0].address_components[0].long_name)

				defer.resolve();

			});

		}, 200 * promises.length);

	});

	cities2.forEach(function(city){

		if(!city){
			console.log('no after city for: ' + person['first_name'])
			return false;
		}

		var defer = q.defer();
		promises.push(defer.promise);

		geocoder.geocode(city, function ( err, data ) {

			if(!data || data.results.length === 0 || err){
				console.log('err', err);
				return false;
			}

			if(!data.results.length === 0 || !data.results[0].geometry){
				console.log('not found:' +  city + ' for: ' + person['first_name']);
				return false;
			}

			person.after.push({
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
