/*
* xObject design by contract plugin
*
* Contracts are defined as objects:
* @example
* var ConcreteContract = {
*    methodA : ["string", MyObject],
*    methodB : {
*         onEntry:  ["string", MyObject],
*         validators: [function(arg){}],
*         onExit: "string"
*     }
* }
*
* To assign a contract, the '__contract__' property is used.
*
* @example
*
* App.ConcreteContract = {
*     methodA : [ "number", App.InjectedDependency ],
*     methodB : {
*         onEntry: [ "number", App.InjectedDependency ],
*         validators: [function(arg){
*             return arg > 10;
*         }],
*         onExit: "string"
*     },
*     methodC : {
*         onExit: "string"
*     }
* };
* App.EmployedModule = function() {
*     return {
*         __contract__: App.ConcreteContract,
*         methodA : function() {
*         },
*         methodB : function() {
*             return "a string";
*         },
*         methodC : function() {
*             return []; // Not a string
*         }
*     }
* };
*
* var dependency = xObject.create( App.InjectedDependency ),
*     module = xObject.create( App.EmployedModule );
*
* module.methodA(555, dependency); -> OK
* module.methodA('a string', dependency); -> TypeError exception
* module.methodA(555, {}); -> TypeError exception
* module.methodB(555, dependency); -> TypeError exception
* module.methodB(1, dependency); -> RangeError exception (validator)
* module.methodC(); -> TypeError exception (onExit)
*
* @package xObject.dbc
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
				* @param {array|object} contract
				* @param {object} instance
				*/
			overrideMethod = function( method, contract, instance ) {
				var origFn = instance[ method ];
				// Normalize interface-style shorthand ["string", MyObject] to full form
				if ( xObject.isArray( contract ) ) {
					contract = { onEntry: contract };
				}
				instance[ method ] = function() {
					var i = 0, len = arguments.length, res;
					for ( ; i < len; i++ ) {
						// onEntry type check
						if ( contract.onEntry && arguments[ i ] && contract.onEntry[ i ] &&
							!matchArgTypeHint( arguments[ i ], contract.onEntry[ i ] ) ) {
							throw new TypeError(
								"Argument #" + ( parseInt( i, 10 ) + 1 ) + " of method '" + method + "' " +
								( typeof contract.onEntry[ i ] === "string" ?
								"is required to be a '" + contract.onEntry[ i ] + "'" :
								" violates the contract" ) );
						}
						// Validators
						if ( contract.validators &&
							typeof contract.validators[ i ] === "function" &&
							!contract.validators[ i ]( arguments[ i ] ) ) {
							throw new RangeError( "Argument #" + ( parseInt( i, 10 ) + 1 ) +
								" of method '" + method + "' is outside of its valid range" );
						}
					}
					res = origFn.apply( instance, arguments );
					// onExit type check
					if ( contract.onExit && !matchArgTypeHint( res, contract.onExit ) ) {
						throw new TypeError( "Method '" + method +
							"' return value is required to be a " + contract.onExit );
					}
					return res;
				};
			};
		// Contract is an object specified in __contract__ property
		if ( instance.__contract__ ) {
			for ( var prop in instance.__contract__ ) {
				if ( instance.__contract__.hasOwnProperty( prop ) ) {
					if ( instance[ prop ] !== undefined ) {
						overrideMethod( prop, instance.__contract__[ prop ], instance );
					} else {
						throw new SyntaxError( "Contract requires '" +
							prop + "' method" );
					}
				}
			}
		}
	});
}( this ));
