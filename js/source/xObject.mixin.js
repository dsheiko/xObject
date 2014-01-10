/*
* xObject mixin plugin
*
* Mixin is a mechanism for code reuse and multiple inhertitance
*
* To implement mixins, the '__mixin__' property is used and expected array of mixing objects.
*
* @example
*
* App.MixinA = {
*   propertyA: "propertyA"
* };
* App.MixinB = {
*   propertyB: "propertyB"
* };
* App.Silo = function() {
*   return {
*     __mixin__: [ App.MixinA, App.MixinB ],
*     ownPropery: "Own property"
*   }
* };
* var module = xObject.create( App.Silo );
* module.ownPropery is defined
* module.propertyA is defined
* module.propertyB is defined
*
* @package xObject.Mixin
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* @jscs standard:Jquery
* Code style: http://docs.jquery.com/JQuery_Core_Style_Guidelines
*/

(function( global ) {
	"use strict";
	var xObject = global.xObject || {};

	xObject.hooks = xObject.hooks || [];
	/**
		* Hook handler
		* @param {object} instace
		* @param {array} args
		*/
	xObject.hooks.push(function( instance, args ) {
		if ( instance.__mixin__ && xObject.isArray( instance.__mixin__ ) ) {
		for (var i = 0, len = instance.__mixin__.length; i < len; i++ ) {
			var trait = instance.__mixin__[ i ];
			xObject.mixin( instance, trait );
		}
		}
	});

	return xObject;
}( this ));