var fs = require('fs');
var parseCsv = require('dank-csv');
var geocoder = require('geocoder');
var q = require('q');
var Nightmare = require('nightmare');

var data = fs.readFileSync(__dirname + '/hyper.csv');
var csv = parseCsv(data.toString('utf8'));
var promises = [];

csv.forEach(function(person){

	var cities = person['before_hyper'].replace('; ', ';').split(';');
	var cities2 = person['after_hyper'].replace('; ', ';').split(';');
	person.before = [];
	person.after = [];

	person.slug = person['first_name'].replace(/ /g, '-') + '-' + person['last_name'].replace(/ /g, '-');
	person.slug = person.slug.toLowerCase();

	cities.forEach(function(city){

		var defer = q.defer();
		promises.push(defer.promise);

		setTimeout(function(){

			geocoder.geocode(city, function ( err, data ) {

				if(err || data.results.length === 0 || !data.results[0].geometry){
					console.log('not found:' +  city + ' for: ' + person['first_name']);
					defer.resolve();
					return false;
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

		setTimeout(function(){

			geocoder.geocode(city, function ( err, data ) {

				if(!data || data.results.length === 0 || err){
					console.log('error', err, data.results.length);
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

		}, 200 * promises.length);

	});


	//get instagram data
	if(person.instagram){

		console.log('prepare scraping instagram pic for: ' + person.instagram);

		var insta = new Nightmare();
		var instaDef = q.defer();
		promises.push(instaDef.promise);

		setTimeout(function(){
			insta
				.goto('https://www.instagram.com/'+ person.instagram +'/')
				.evaluate(function () {
					return window._sharedData;
				})
				.end()
				.then(function(data) {

					try{
						if(data['entry_data'].ProfilePage[0].user.profile_pic_url_hd){
							person.instagramPic = data['entry_data'].ProfilePage[0].user.profile_pic_url_hd;
							person.hd = true;
						} else {
							person.instagramPic = data['entry_data'].ProfilePage[0].user.profile_pic_url;
							person.hd = false;
						}
						console.log('instagram pic for: ' + person['first_name'] + ' found');
					}
					catch(e){
						console.log('instagram pic for: ' + person['first_name'] + ' not found');
					}

					instaDef.resolve();

				})

			insta.run(function(){});

		}, promises.length * 750);

	}

});


q
	.all(promises)
	.then(function(){

		console.log('done building data')

		var data = JSON.stringify(csv);
		fs.writeFileSync( __dirname + '/data.json', data);

	})
