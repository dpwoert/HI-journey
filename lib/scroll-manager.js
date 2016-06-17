import _offset from './offset.js';

var generateUUID = function(){
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	s4() + '-' + s4() + s4() + s4();
};

var manager = function(){

	var list = [];
	var prev;
	var resizeNeeded = false;

	var previous = null;
	this.scrollDirection = 'down';

	var resize = function() {

		//resize all elements
		for ( var i = 0 ; i < list.length ; i++ ) {
			list[i] = this.getElementRect( list[i] );
		}

		resizeNeeded = false;

	}.bind(this);

	var loop = function() {

		var top = window.pageYOffset;
		var bottom = top + window.innerHeight;

		//detect scroll direction
		previous = previous === null ? top : previous;
		this.scrollDirection = previous > top ? 'top' : 'bottom';
		previous = top;

		//throttle checking
		window.requestAnimationFrame(loop);

		//prevent looping when user hasnt scrolled
		if (prev === top && !resizeNeeded) {
			return false;
		}

		//resize needed?
		if (resizeNeeded) {
			resize();
		}

		//save current scroll
		prev = top;

		//define readline
		var readline = top + window.innerHeight * 0.3;

		var item, myTop, myBottom;

		for ( var i = 0 ; i < list.length ; i++ ) {

			item = list[i];
			myTop = item.top;
			myBottom = item.bottom;

			//sticky?
			if (item.sticky) {
				myTop += window.innerHeight;
				myBottom -= window.innerHeight;
			}

			//offset?
			if (item.offset._top) {
				myTop += item.offset._top;
			}
			if (item.offset._bottom) {
				myBottom += item.offset._bottom;
			}

			var position = top > myTop ? 'bottom' : 'top';

			if (
				(myTop >= top && myTop < bottom) ||
				(myBottom > top && myBottom < bottom) ||
				(myTop < top && myBottom > bottom)
			) {

				//don't repeatedly trigger events
				if (!item.inview) {

					//trigger event
					item.inview = true;
					item.evt(true, position);

				}

			} else if (item.inview === true) {

				//send an event when going out of view
				item.inview = false;
				item.evt(false, position);

			}

			//readline
			if ( item.readline && item.top < readline && item.bottom > readline ) {

				if ( !item.readlineActive ) {
					$rootScope.$broadcast('readline', item);
					item.readlineActive = true;
				}

			} else {
				item.readlineActive = false;
			}

		}

		item = null;
		myTop = null;
		myBottom = null;

	}.bind(this);

	//start looping
	loop();

	var getOffset = function(value) {

		if (value.indexOf('%') > -1) {
			return (parseInt(value) / 100) * window.innerHeight;
		} else {
			return parseInt(value);
		}

	};

	this.getElementRect = function(object) {

		var rect = _offset(object.element);

		//do calculations
		object.top = rect.top;
		object.bottom = rect.top + object.element.offsetHeight;

		//offset?
		if (object.offset.top) {
			object.offset._top = getOffset(object.offset.top);
		}
		if (object.offset.bottom) {
			object.offset._bottom = getOffset(object.offset.bottom);
		}

		rect = null;

		//return information about rectangle/boundingbox of element
		return object;

	};

	this.add = function(options) {

		options = Object.assign({
			element: null,
			evt: function() {},
			offset: 0,
			readline: false,
			changeClass: false,
			inview: false,
			id: generateUUID()
		}, options);

		//get top and bottom position (in px) of element
		var rect = this.getElementRect(options);

		//add properties of element to list
		list.push(rect);

		//return id for removing
		return rect.id;

	};

	this.clear = function() {
		list = [];
	};

	this.remove = function(id) {

		for ( var i = 0 ; i < list.length ; i++ ) {

			if ( list[i].id === id) {

				list[i].element = null;
				list[i].evt = null;
				list[i].offset = null;
				list[i] = null;

				list.splice(i, 1);
			}

		}

	};

	this.recalculate = function() {
		resizeNeeded = true;
	};

	window.addEventListener('resize', resize, false );

};

export default new manager();
