/*
* xObject design by contact plugin
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
* module.methodA('a string', dependency); -> OK
* module.methodA(555, dependency); -> TypeError exception
* module.methodA("a string", {}); -> TypeError exception
* module.methodB(555, dependency); -> TypeError exception
* module.methodB(1, dependency); -> RangeError exception
* module.methodC(); -> TypeError exception (onExit)
*
* @package xObject.dbc
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* @jscs standard:Jquery
* Code style: http://docs.jquery.com/JQuery_Core_Style_Guidelines
*/

(function( global, undefined ) {
    "use strict";
    global.jsa = global.jsa || {};
    /**
     * Extends object factory with __contract__ support
     *
     * Contract syntax
     * @example
     * var ConcreteContract = {
     *    methodA : ["string", MyObject],
     *    methodB : {
     *         onEntry:  ["string", MyObject],
     *         validators: [function(arg){}],
     *         onExit: "string"
     *     }
     * }
     * Allowed types:
     * 'boolean', 'number', 'string', 'array', 'function', Class-object
     */
    global.jsa.Hook = global.jsa.Hook || [];
    /**
     * Hook handler
     * @param {object} instace
     * @param {array} args
     */
    global.jsa.Hook.push(function( instance, args ) {
        /**
         * @param {*} arg
         * @param {*} typeHint  can be type or object
         */
        var matchArgTypeHint = function( arg, typeHint ) {
                if (typeof(typeHint) === "string") {
                    if ( typeHint in {
                        'string': null, 'number': null, 'boolean': null, 'function': null } ) {
                        return typeof arg === typeHint;
                    } else if ( typeHint === "array" ) {
                        return global.jsa.isArray ( arg );
                    } else {
                        throw new SyntaxError( "Invalid type hint '" +
                            typeHint + "'. Type hint can be a string ('string', 'number', 'boolean', 'array') or an object." );
                    }
                } else {
                    return arg instanceof typeHint;
                }
                return true;
            },
            /**
             * @param {string} method
             * @param {object} contract
             * @param {object} instance
             */
            overrideMethod = function( method, contract, instance ) {
                var origFn = instance[ method ];
                // If the contract in the form of interface
                // "methodA" : ["string", MyObject]
                if (global.jsa.isArray (contract)) {
                    contract = {
                        onEntry: contract
                    };
                }
                instance[ method ] = function() {
                    var i = 0, len = arguments.length, res;
                    for ( ; i < len; i++ ) {
                        // OnEntry
                        if ( contract.onEntry && arguments[ i ] && contract.onEntry[ i ] &&
                            !matchArgTypeHint( arguments[ i ], contract.onEntry[ i ])) {
                            throw new TypeError(
                                "Argument #" + ( parseInt( i, 10 ) + 1 ) + " of method '" + method + "' " +
                                ( typeof contract.onEntry[ i ] === "string" ?
                                "is required to be a '" + contract.onEntry[ i ] + "'" :
                                " violates the contract" ) );
                        }
                        // Validators
                        if ( contract.validators &&
                            typeof( contract.validators[ i ] ) === "function" &&
                            !contract.validators[ i ](arguments[ i ])) {
                            throw new RangeError( "Argument #" + ( parseInt( i, 10 ) + 1 ) +
                                " of method '" + method + "' " +
                                " is outside of its valid range" );
                        }
                    }
                    res = origFn.apply( instance, arguments );
                    // OnExit
                    if ( contract.onExit && !matchArgTypeHint( res, contract.onExit ) ) {
                        throw new TypeError( "Method '" + method +
                            "' return value is required to be a " + contract.onExit );
                    }
                    return res;
                };
        };
        // Contract is an object, specified in contract property
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