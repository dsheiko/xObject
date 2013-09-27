/*
* xObject
*
* xObject is a light-weight framework, which consists of following parts:
* factory method providing prototypal inheritance for modules
* xObject.BaseAbstract and xObject.WidgetAbstract classes, bringing
*   YUI widget experience (http://yuilibrary.com/yui/docs/widget/) into your application
* xObject.Hooks allowing to assign factory hooks (e.g. interfaces, mixins, type hinting control)
*
* xObject can be exploited over any JS-library. You just have to specify a callback for querySelector
* function of the library you utilize.
*
* @example
* var AbstractModule = function () {
*   var privateProp = "..";
*   return {
*       __extends__: xObject.BaseAbstract
*       // module public constructor
*       init: function () {
*       },
*       publicProp: "..."
*   };
* },
* ConcreteModule = function(optionalArg) {
*   return {
*       __extends__: AbstractModule
*   };
* },
* o = ConcreteModule.makeInstance(optionalArg);
* o instanceof ConcreteModule === true
* o instanceof AbstractModule === true
* o instanceof xObject.BaseAbstract === true
*
* @package xObject
* @author sheiko
* @version 2.03
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* @jscs standard:Jquery
* Code style: http://docs.jquery.com/JQuery_Core_Style_Guidelines
*/

(function( global ) {
    "use strict";
        /**
         * @namespace
         * xObject hooks can be already declared; the order by which JavaScript components load doesn't matter
         */
    var xObject = global.xObject || {},
        /**
         * Create instance of a given type and pass arguments to its constructor
         *
         * @see xObject.create
         * @param {function} constr - class object || {object} proto
         * @param {array} args - array of arguments
         * @return {object} instance
         */
        createInstance = function( constr, args, props ) {
          var instance,
              members = ( typeof constr === "function" ? constr.apply( constr.prototype, args || [] ) : constr ),
              Fn = function () {};

          // mix-in properties if any given
          xObject.mixin( members || {}, props || {} );

          // Inherit from a super type if any specified in __extends__ property
          if ( members.hasOwnProperty( "__extends__" ) && members.__extends__ ) {
              constr.prototype = createInstance( members.__extends__, args );
          }
          // Copy given type prototype linking to a new constructor
          Fn.prototype = constr.prototype || {};
          // Mix-in members of given type to the new constructor's prototype
          xObject.mixin( Fn.prototype, members );
          instance = new Fn();
          // Call constructor function if any specified in __constructor__ property

          members.hasOwnProperty("__constructor__") &&
              members.__constructor__.apply( instance, args || [] );
          return instance;
        };
    /**
     * Factory hooks manager
     * Any hook assigned by the object will be invoked right after factory creates a new instance
     * @module
     */
    xObject.hooks = (function( extHooks ) {
        var hooks = extHooks;
        return {
            /**
             * Append a given hook to the list
             * @param (function) fn
             */
            push : function( fn ) {
                hooks.push( fn );
            },
            /**
             * Invoke all the assigned hooks
             * @param {object} instance
             * @param {array}  args
             */
            invokeAll: function( instance, args ) {
                var len = hooks.length, i = 0;
                for ( ; i < len; i++ ) {
                    hooks[ i ]( instance, args );
                }
            }
        };
    }( xObject.Hook || [] ));
    /**
     * Check is a supplied type an array
     * @param {mixed} obj
     * @return {boolean}
     */
    xObject.isArray = function ( obj ) {
        return ( Object.prototype.toString.call( obj ) === '[object Array]' );
    };
    /**
     * Mix-in memebers of one object to another
     * @param {object} dst
     * @param {object} payload
     */
    xObject.mixin = function( dst, payload ) {
      var key;
      for ( key in payload ) {
          if ( payload.hasOwnProperty( key ) ) {
              dst[ key ] = payload[ key ];
          }
      }
    };

    /**
     * Core factory method implementing controlled instation
     * xObject.create( constructor || proto [, argumentsArray, propertiesObject ])
     *
     * @param {function} constructor ||  {object} prototype
     * [@param {array} constructor arguments array]
     * [@param {object} properties object to mix-in]
     * @return (object) instance
     */
    xObject.create = function () {
        var instance,
            constr,
            args = [],
            props = {};

        if ( !arguments.length ) {
            throw new Error("First argument (constructor or proto) required.");
        }
        if ( typeof arguments[ 0 ] !== "object" && typeof arguments[ 0 ] !== "function" ) {
            throw new TypeError("Invalid type argument '" + typeof arguments[ 0 ] + "'. Here expected either function (constructor) or object (proto)");
        }
        if ( arguments.length === 2 && xObject.isArray( arguments[ 1 ] ) && typeof arguments[ 1 ] !== "object") {
            throw new TypeError("Invalid type argument '" + typeof arguments[ 1 ] + "'. Here expected either arguments array or properties object");
        }
        if ( arguments.length === 3 && typeof arguments[ 2 ] !== "object" ) {
            throw new TypeError("Invalid type argument '" + typeof arguments[ 2 ] + "'. Here expected properties object");
        }

        constr = arguments[ 0 ];

        if ( xObject.isArray( arguments[ 1 ] ) ) {
            args = arguments[ 1 ];
            props = arguments[ 2 ] || {};
        } else {
            props = arguments[ 1 ];
        }

        instance = createInstance( constr, args, props );
        xObject.hooks.invokeAll( instance, arguments );
        return instance;
    };

    global.xObject = xObject;
    return xObject;

})( this );
