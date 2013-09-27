/*
* JSA Test Suit
*
* @package jsa-tests
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* @jscs standard:Jquery
* Code style: http://docs.jquery.com/JQuery_Core_Style_Guidelines
*/

(function( global, module, undefined ) {
  var xObject = global.xObject,
      stub = {

        TestConstructor: {
          SuperType : function( arg ) {
            return {
              prop: null
            };
          },
          SubType: function( arg ) {
            return {
              "__extends__": this.SuperType,
              "__constructor__": function( arg ) {
                  this.prop = arg;
              }
            };
          }
        },

        /**
         * Check the behavior derived from WidgetAbstract
         */
        TestWidget: function() {
          return {
            "__extends__": xObject.WidgetAbstract,
            HTML_PARSER : {
              wrapper : 'div.wrapper',
              subject : 'p.subject'
            },
            init : function() {
              this.node.boundingBox.addClass('init');
            },
            syncUi : function() {
              this.node.boundingBox.addClass('syncUi');
            },
            renderUi : function() {
              this.node.boundingBox.addClass('renderUi');
              if ( this.node.wrapper.length ) {
                  this.node.boundingBox.addClass('wrapperFound');
              }
              if ( this.node.subject.length ) {
                  this.node.boundingBox.addClass('subjectFound');
              }
            }
           };
         },

        /**
         * Checks module inheritance
         */
        log: [],

        AbstractModule: function( settings ) {
         var _privateVar = "abstract-private-access";
         return {
            "__extends__": xObject.WidgetAbstract,
            inheritedProp : "inherited-prop-access",
            inheritedPrivilegedMethod : function() {
                return _privateVar;
            },
            init : function() {
               stub.log.push('abstract-module-initialized');
            }
         };
        },

        ConcreteModule: function() {
         return {
            "__extends__": stub.AbstractModule,
            /** @property arr */
            arr: [],
            init: function() {
                stub.log.push('concrete-module-initialized');
            },
            renderUi: function() {
                 stub.log.push('concrete-module-rendered');
            },
            bindUi: function() {
                 stub.log.push('concrete-module-bound');
            },
            syncUi: function() {
                 stub.log.push('concrete-module-synchronized');
            }
          };
        },
        /**
         * Check interface implementation
         */
        ViolatingModule: function() {
          return {
              "__implements__": stub.ConcreteInterface
          };
        },

        InjectedDependency: function() {
            return {
            };
        },

        ConcreteInterface: {
            requeriedMethod : [ "string", this.InjectedDependency ]
        },

        StrictModule: function() {
         return {
             "__implements__": stub.ConcreteInterface,
             requeriedMethod : function() {
             }
         };
        },
        /*
         * Check design by contract implementation
         */
        ConcreteContract: {
          methodA : [ "number", this.InjectedDependency ],
          methodB : {
              onEntry: [ "number", this.InjectedDependency ],
              validators: [ function( arg ){
                  return arg > 10;
              } ],
              onExit: "string"
           },
           methodC : {
              onExit: "string"
           }
        },

      EmployedModule: function() {
        return {
          "__contract__": stub.ConcreteContract,
          methodA : function() {
          },
          methodB : function() {
              return "a string";
          },
          methodC : function() {
              return []; // Not a string
          }
        };
      },


      MixinA: {
        propertyA: "propertyA"
      },
      MixinB: {
        propertyB: "propertyB"
      },
      Silo: function() {
        return {
          "__mixin__": [ stub.MixinA, stub.MixinB ],
          ownPropery: "Own property"
        };
      }
  };
  global.stub = stub;
 })( this );
