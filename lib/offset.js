
//jquery offset top to vanilla js
var isWindow = function( obj ) {
    return obj !== null && obj === obj.window;
};
var getWindow = function( elem ) {
    return isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
};
var offset = function( elem ) {

    var docElem, win,
        box = { top: 0, left: 0 },
        doc = elem && elem.ownerDocument;

    docElem = doc.documentElement;

    if ( typeof elem.getBoundingClientRect !== typeof undefined ) {
        box = elem.getBoundingClientRect();
    }
    win = getWindow( doc );
    return {
        top: box.top + win.pageYOffset - docElem.clientTop,
        left: box.left + win.pageXOffset - docElem.clientLeft
    };

};

/**
 * Retrieve offset of an element
 * @param {DOMNode|jQlite} element
 * @returns {Object} - object with top, left key
 */
export default function(element) {

	if (typeof element.innerHTML === 'string') {
		return offset(element);
	} else {
		return offset(element[0]);
	}

};
