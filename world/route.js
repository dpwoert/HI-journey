(function(){

	var colors = {
		'after': new THREE.Color(0xf33f00),
		'before': new THREE.Color(0x04cdae),
	};

	var safeList = [
		'Manchester',
		'Sao Paolo',
		'Berlin',
		'Hong Kong',
		'Singapore',
		'Dubai',
		'New York',
		'Mumbai',
		'Manilla',
		'Johannesburg',
		'São Paulo',
		'Madrid'
	];

	var doubleList = [];

	var createLabel = function(label, position){

		var fontface = 'Helvetica neue';
		var fontsize = 18 * window.devicePixelRatio;
		var paddingTop = 5 * window.devicePixelRatio;
		var paddingLeft = 10 * window.devicePixelRatio;
		// var spriteAlignment = THREE.SpriteAlignment.topLeft;

		var canvas = document.createElement('canvas');
		canvas.width = 256 * window.devicePixelRatio;
		canvas.height = 256 * window.devicePixelRatio;

		var context = canvas.getContext('2d');
		context.font = "Bold " + fontsize + "px " + fontface;

		// get size data (height depends only on font size)
		var metrics = context.measureText( label );
		var textWidth = metrics.width;
		var textHeight = fontsize * 1.4;

		var left = canvas.width / 2 - textWidth / 2 - paddingLeft;
		var top = canvas.height / 2 - textHeight / 2 - paddingTop;

		// background color
		context.fillStyle = "black";
		context.fillRect(left, top,textWidth + paddingLeft * 2,textHeight + paddingTop * 2);

		// label
		context.fillStyle = "white";
		context.fillText( label, left + paddingLeft, canvas.height/2 + paddingTop);

		// canvas contents will be used for a texture
		var texture = new THREE.Texture(canvas)
		texture.needsUpdate = true;

		var spriteMaterial = new THREE.SpriteMaterial({ map: texture, color: 0xffffff });
		var sprite = new THREE.Sprite( spriteMaterial );
		var ratio = 0.02;
		sprite.scale.set( 256 * ratio, 256 * ratio, 256 * ratio );
		sprite.needsUpdate = true;
		sprite.frustumCulled = false;
		sprite.position.copy(position);

		return sprite;

	};

	var materials = {};
	for(var type in colors) {

		var color = colors[type];
		materials[type] = {};

		materials[type].line = new THREE.MeshLineMaterial({
			color: color.clone(),
			lineWidth: 0.2,
			opacity: 1,
			transparent: true,
			resolution: new THREE.Vector2( window.innerWidth, window.innerHeight )
		});

		materials[type].bullit = new THREE.MeshBasicMaterial({
			color: color.clone(),
			// shading: THREE.FlatShading
		});

	};

	window.Route = function(world){

		var id = THREE.Math.generateUUID();
		var points = [];
		var geos = [];
		var curves = [];
		var meshes = [];
		var labels = [];
		var useTracking = false;
		var trackSpeed = 0;

		var range = d3.scale.linear().domain([10, 15000]).range([1.1, 1.8])

		var getPrevious = function(){
			if(points.length > 0){
				return points[points.length - 1].clone();
			} else {
				return new THREE.Vector3();
			}
		};

		var addCurve

		this.add = function(lat, lon, curveHeight, label, labelOffset){

			var previous = getPrevious();
			var point = tools.degreeToVec3(lat, lon, 0.35, world.radius);
			points.push(point);
			geos.push([lat, lon]);

			//curve to somewhere
			if(curveHeight && geos.length > 1){

				var start = geos[geos.length - 2];

				start = turf.point(start);
				end = turf.point([lat, lon]);
				var center = turf.midpoint(start, end);
				var distance = turf.distance(start, end);
				center = tools.degreeToVec3(center.geometry.coordinates[0], center.geometry.coordinates[1], 0.35, world.radius);
				center = new THREE.Vector3().lerp(center, range(distance));

				// var center = previous.clone().lerp(point, 0.5);
				// center = new THREE.Vector3(0,0,0).lerp(center, 1 + (curveHeight/10));

				var curve = new THREE.QuadraticBezierCurve3(previous, center, point);
				curves.push(curve);
			}

			//label
			if(label && safeList.indexOf(label) > -1 && doubleList.indexOf(label) === -1){

				labelOffset = labelOffset || 0.1;

				var labelPos = new THREE.Vector3(0,0,0).lerp(point, 1 + labelOffset);
				var _label = createLabel(label, labelPos);

				meshes.push(_label);
				world.rotated.add(_label);

				doubleList.push(label);

			}

			//chainable
			return this;
		};

		this.addPoint = function(lat, lon, label, labelOffset){

			var point = tools.degreeToVec3(lat, lon, 0.35, world.radius);
			points.push( point );

			if(label && safeList.indexOf(label) > -1){

				labelOffset = labelOffset || 0.1;

				var labelPos = new THREE.Vector3(0,0,0).lerp(point, 1 + labelOffset);
				var _label = createLabel(label, labelPos);

				meshes.push(_label);
				world.rotated.add(_label);

			}


			//chainable
			return this;

		};

		this.build = function(type, quality){

			type = type || 'driver';
			quality = quality || 30;

			//create lines
			curves.forEach(function(curve){

				var allPoints = curve.getPoints(quality);
				var geometry = new THREE.Geometry();
				geometry.vertices = allPoints;
				geometry.verticesNeedUpdate = true;
				geometry.lineDistancesNeedUpdate = true;

				//create line
				var line = new THREE.MeshLine();
				line.setGeometry( geometry );
				var mesh = new THREE.Mesh( line.geometry, materials[type].line );
				meshes.push(mesh);
				world.rotated.add(mesh);

			});

			// points.push(new THREE.Vector3(0,0,0))

			//create bullits
			points.forEach(function(point, key){

				var geometry = new THREE.SphereGeometry( 0.1, 12, 12 );
				var mesh = new THREE.Mesh( geometry, materials[type].bullit );

				//set position
				mesh.position.copy(point);

				meshes.push(mesh);
				world.rotated.add(mesh);

			});

		};

		this.track = function(speed){
			useTracking = true;
			trackSpeed = speed;

			//add to list

			//chainable
			return this;
		};

		this.update = function(){

		};

		this.show = function(show){
			meshes.forEach(function(mesh){
				mesh.visible = show;
			});
		};

		this.remove = function(){
			meshes.forEach(function(mesh){
				world.rotated.remove(mesh);
				mesh.geometry.dispose();
			});

			points = undefined;
			curves = undefined;
			meshes = undefined;

			//chainable
			return this;
		};

	};

}());
