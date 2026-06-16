/*
* xObject Interface plugin
*
* Object interfaces allow you to create code which specifies which methods a class must implement,
* without having to define how these methods are handled.
*
* Interfaces are defined as objects:
* @example
* Interface = {
*     methodName : ["string", Class, ..],
*     ..
* };
*
* To implement an interface, the '__implements__' property is used.
*
* @example
*
* App.ViolatingModule = function() {
*  return {
*    __implements__: App.ConcreteInterface
*  };
* };
* App.InjectedDependency = function() {
*   return {};
* };
*
* App.ConcreteInterface = {
*   requiredMethod : ["string", App.InjectedDependency]
* };
*
* App.StrictModule = function() {
*   return {
*      __implements__: App.ConcreteInterface,
*      requiredMethod : function() {}
*   }
* };
*
* xObject.create( App.ViolatingModule ); -> SyntaxError exception
* var dependency = xObject.create( App.InjectedDependency ),
*     module = xObject.create( App.StrictModule );
*
* module.requiredMethod("a string", dependency); -> OK
* module.requiredMethod(555, dependency); -> TypeError exception
* module.requiredMethod("a string", {}); -> TypeError exception
*
* @package xObject.Interface
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
*/

(function( global, undefined ) {
	"use strict";
	var xObject = global.xObject || {};

	xObject.hooks = xObject.hooks || [];
	/**
		* Hook handler
		* @param {object} instance
		* @param {array} args
		*/
	xObject.hooks.push(function( instance, args ) {
		/**
			* @param {*} arg
			* @param {*} typeHint  can be a primitive type string or a constructor
			*/
		var matchArgTypeHint = function( arg, typeHint ) {
				if ( typeof typeHint === "string" ) {
					if ( typeHint in { "string": null, "number": null, "boolean": null, "function": null } ) {
						return typeof arg === typeHint;
					} else if ( typeHint === "array" ) {
						return xObject.isArray( arg );
					} else {
						throw new SyntaxError( "Invalid type hint '" +
							typeHint + "'. Type hint can be a string ('string', 'number', 'boolean', 'array') or an object." );
					}
				} else {
					return arg instanceof typeHint;
				}
			},
			/**
				* @param {string} method
				* @param {array} methodInterface
				* @param {object} instance
				*/
			overrideMethod = function( method, methodInterface, instance ) {
				var origFn = instance[ method ];
				instance[ method ] = function() {
					for ( var i = 0, len = arguments.length; i < len; i++ ) {
						if ( arguments[ i ] && methodInterface[ i ] &&
							!matchArgTypeHint( arguments[ i ], methodInterface[ i ] ) ) {
							throw new TypeError(
								"Argument #" + ( parseInt( i, 10 ) + 1 ) + " of method '" + method + "' " +
									( typeof methodInterface[ i ] === "string" ?
									"is required to be a '" + methodInterface[ i ] + "'" :
									" violates the implemented interface" ) );
						}
					}
					return origFn.apply( instance, arguments );
				};
			};
		// Interface is an object specified in __implements__ of the form:
		// { "methodA" : ["string", MyObject], .. }
		if ( instance.__implements__ ) {
			for ( var prop in instance.__implements__ ) {
				if ( instance.__implements__.hasOwnProperty( prop ) ) {
					if ( instance[ prop ] !== undefined ) {
						overrideMethod( prop, instance.__implements__[ prop ], instance );
					} else {
						throw new SyntaxError( "Implemented interface requires '" +
							prop + "' method" );
					}
				}
			}
		}
	});
}( this ));
