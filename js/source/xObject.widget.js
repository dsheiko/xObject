/**
	* xObject Widget/Base Abstract class plugin
	*
	* @example
	* Widget = function( settings ) {
	*     return {
	*         __extends__ : xObject.WidgetAbstract,
	*         HTML_PARSER : {
	*             toolbar : 'div.toolbar'
	*         },
	*         init : function() {
	*             console.log('init performed');
	*         },
	*         renderUi : function() {
	*             console.log('renderUi performed');
	*         },
	*         bindUi : function() {
	*             console.log('bindUi performed');
	*             // bind a handler to this.node.toolbar
	*         },
	*         syncUi : function() {
	*             console.log('syncUi performed');
	*            // actualize the state of widget
	*         }
	*     };
	* };
	*
	* var o = xObject.create( Widget, { boundingBox: $('div#widget') } );
	* // init performed
	* // renderUi performed
	* // bindUi performed
	* // syncUi performed
	* console.log(o.node); // contains boundingBox and toolbar
	*
	* @package xObject.Widget
	* @author sheiko
	* @license MIT
	* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
	* @jscs standard:Jquery
	* Code style: http://docs.jquery.com/JQuery_Core_Style_Guidelines
	*/

(function( global, undefined ) {
	"use strict";
	var xObject = global.xObject || {};

	xObject.hooks = xObject.hooks || [];

	/**
		* Configure your own querySelector function
		* @param {string} selector
		* @param {object} context (optional)
		* @return {object} node
		*/
	xObject.querySelectorFn = xObject.querySelectorFn || global.jQuery || function( selector, context ) {
		context = context || global.document;
		if ( typeof selector === "object" ) {
		return selector;
		}
		return context.querySelector( selector );
	};

	/**
		* Hook available for instaces of xObject.WidgetAbstract
		* @param {object} instace
		* @param {array} args
		*/
	xObject.hooks.push(function ( instance ) {
		var i = 0;
		if ( instance instanceof xObject.WidgetAbstract === false ) {
			return;
		}
		if ( instance.boundingBox === undefined ) {
			throw new TypeError( "Widget derivative is expected to get an argument, " +
				"which contains settings object with boundingBox property" );
		}
		instance.node = {};
		instance.node.boundingBox = xObject.querySelectorFn( instance.boundingBox );
		if ( instance.HTML_PARSER ) {
			for ( i in instance.HTML_PARSER ) {
			if ( instance.HTML_PARSER.hasOwnProperty( i ) ) {
				instance.node[ i ] = xObject.querySelectorFn( instance.HTML_PARSER[ i ],
					instance.node.boundingBox );
			}
			}
		}
		});

	/**
		* Hook available for instaces of xObject.BaseAbstract
		* @param {object} instace
		*/
	xObject.hooks.push(function ( instance ) {
		var bootstrapMethods = [ "init", "renderUi", "bindUi", "syncUi" ],
			i = 0,
			len = bootstrapMethods.length;
		if ( instance instanceof xObject.BaseAbstract === false ) {
		return;
		}
		for ( ; i < len; i++ ) {
		instance[ bootstrapMethods[ i ] ] && instance[ bootstrapMethods[ i ] ]();
		}

	});
	/**
		* Base is designed to be a low-level foundation class from which other
		* classes can be derived. It tries to invoke automatically init, renderUI, syncUI methods
		* of every class the last successor class inherit
		**/
		xObject.BaseAbstract = function() {
			return {};
		};

		/**
		* Widget is the foundation class from which all widgets are derived.
		* It provides the following pieces of core functionality on top of
		* what BaseAbstract already provides:
		*  - A common set of widget attributes
		*  - Consistent markup generation support
		*/
	xObject.WidgetAbstract = function() {
		return {
		"__extends__": xObject.BaseAbstract
		};
	};
}( this ));