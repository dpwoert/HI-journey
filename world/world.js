window.World = function(canvas){

	this.isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 && navigator.userAgent && !navigator.userAgent.match('CriOS');

	var dpr = window.devicePixelRatio = 1;
	var width = (window.innerWidth - 350) * dpr;
	var height = window.innerHeight * dpr;

	var renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor( 0xffffff, 1 );
	renderer.setSize(width, height);

	//add DOM element
	canvas.appendChild( renderer.domElement );

	//setup scene
	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 30, width / height, 1, 1000 );
	this.camera.position.set(0,20,-30);
	this.camera.lookAt(new THREE.Vector3(0,0,0));

	//rotated group
	this.rotated = new THREE.Object3D();
	this.rotated.rotateY(-Math.PI);
	// this.rotated.rotateX(-Math.PI/2);
	this.scene.add(this.rotated)

	//render manager to add abbility to play and add FX
	this.renderManager = new THREE.renderPipeline(renderer);
	var renderPass = new THREE.RenderStep(width, height, this.scene, this.camera);
	var copy = new THREE.ShaderStep(width, height);
	var TiltVert = new THREE.ShaderStep(width, height);
	var TiltHori = new THREE.ShaderStep(width, height);
	var FXAA = new THREE.ShaderStep(width, height);

	//copypass
	copy
		.shader('vertex', document.getElementById('copyVertex').textContent )
		.shader('fragment', document.getElementById('copyFragment').textContent )
		.pipe()
		.renderToScreen();

	//tilt shift
	var pos = 0.65;
	var blur = 5;
	TiltVert
		.setting('v', 'f', blur / width)
		.setting('r', 'f', pos)
		.setting('spread', 'f', 1.9)
		.shader('vertex', document.getElementById('copyVertex').textContent)
		.shader('fragment', document.getElementById('tiltVertiFragment').textContent)
		.pipe();

	TiltHori
		.setting('h', 'f', blur / width)
		.setting('r', 'f', pos)
		.setting('spread', 'f', 1.9)
		.shader('vertex', document.getElementById('copyVertex').textContent)
		.shader('fragment', document.getElementById('tiltHoriFragment').textContent)
		.pipe()

	//create globe
	var cells = 6;
	this.radius = 10;

	//get colors
	var loader = new THREE.XHRLoader();
	var cdark = new THREE.Color(0.2,0.2,0.2);
	var clight = new THREE.Color('#fff');
	loader.load('data/map.json', function (res) {

		var geometry = new THREE.IcosahedronGeometry( this.radius, cells );
		// var geometry = new THREE.SphereGeometry( radius, cells, cells );
		var material = new THREE.MeshPhongMaterial({
			shading: THREE.FlatShading,
			vertexColors: THREE.VertexColors,
		});
		var mesh = new THREE.Mesh( geometry, material );

		var faces = JSON.parse( res );
		faces.forEach(function(face, i){
			// console.log(i, face.inside);
			var color = face.inside ? cdark : clight;
			geometry.faces[i].color = color.clone();
		});

		//heights
		var center = new THREE.Vector3(0,0,0);
		geometry.vertices.forEach(function(vertex){
			var offset = Math.random();
			vertex = vertex.lerp(center, -offset/200);
		});

		this.scene.add(mesh);

		//create lightning
		var light = new THREE.HemisphereLight( 0xffffff, 0xdddddd, 0.5 );
		var directLight = new THREE.PointLight( 0xffffff, 1, 100 );
		var directLight2 = new THREE.PointLight( 0xffffff, 1, 100 );
		directLight.position.set( 0, 50, 0 );
		directLight2.position.set( 0, -50, 0 );
		this.scene.add(light);
		this.scene.add(directLight);
		this.scene.add(directLight2);

		window._geom = geometry;
		window._radius = this.radius;

	}.bind(this));

	var world = this;

	d3
		.json('data/data.json', function(error, rows) {

			console.log(rows);

			rows.forEach((person) => {

				var route = new Route(world);
				var route2 = new Route(world);

				if(person.after.length > 0){
					route2.add(53.480759, -2.242631, 1, 'Manchester');
				}

				person.before.forEach((spot) => {
					route.add(spot.location.lat, spot.location.lng, 1, spot.name);
				});

				person.after.forEach((spot) => {
					route2.add(spot.location.lat, spot.location.lng, 1, spot.name);
				});

				route.add(53.480759, -2.242631, 1, 'Manchester');
				route.build('before');

				if(person.after.length > 0){
					route2.build('after');
				}

				window.Events.addEventListener('selectPerson', function(evt){

					var msg = evt.message;

					if(!msg){
						route.show(true);
						route2.show(true);
					}

					else if(msg['last_name'] === person['last_name']){
						route.show(true);
						route2.show(true);
					}

					else if(msg['last_name'] !== person['last_name']){
						route.show(false);
						route2.show(false);
					}

				})


			});

		});

	//add controls
	var controls = new THREE.OrbitControls( this.camera, renderer.domElement );
	controls.enableDamping = true;
	controls.dampingFactor = 0.2;
	controls.rotateSpeed = 0.2;
	controls.autoRotate = true;
	controls.autoRotateSpeed = -0.1;
	// controls.target.copy(center);

	// make pipeline
	this.renderManager

		.pipe('main', renderPass)
		.pipe('tilt-h', TiltHori)
		.pipe('tilt-v', TiltVert)
		.pipe('toScreen', copy)

		// .pipe('render', function(){
		// 	renderer.render(this.scene, this.camera);
		// }.bind(this))

		.pipe('controls', controls.update.bind(controls))
		.start();

	window.addEventListener('resize', function(){

		dpr = window.devicePixelRatio = 1;
		width = (window.innerWidth - 350) * dpr;
		height = window.innerHeight * dpr;
		renderer.setSize(width, height);

		//update camera
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

	}.bind(this));

};
