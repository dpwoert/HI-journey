THREE.ProcessStep = function(fn, options){

	options = options || {};

	this.process = {
		active: options.active || true,
		runOnce: options.runOnce || false
	};

	this.create = function(){};
	this.render = fn;

	this.destroy = function(){
		options = undefined;
		this.render = undefined;
	};

};
