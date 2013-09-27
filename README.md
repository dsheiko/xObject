# xObject
[![Build Status](https://travis-ci.org/dsheiko/xObject.png)](https://travis-ci.org/dsheiko/xObject)
> A lightweight hookable factory providing control over object instantiation.


## Grounds

As a developer I want to follow 'Constructor that returns Object Literal' pattern while declaring objects as
[in my opinion](http://dsheiko.com/weblog/js-application-design/) it is the best maintainable design available for JavaScript (prior to ES Harmony).
However that structure doesn't allow any easy way to inherit.  As soon as I realised that I can get control over object instantiation via a factory and thus implement a custom inheritance I came up with this library. It was firstly released in 2010 as JSA. Recently the library was refactored and the factory API is changed. Since the factory makes an alternative to Object.create method, it was named xObject.create.

## Features
* Core: Class-based descending inheritance (abstract class -> class -> .. -> final class)
* Mixin hook: Multiple inheritance by using mixins
* Interface hook: Interface annotation and run-time validation
* DbC hook: Design by Contract practices: entry/exit point validators
* Widget hook: YUI-like Widget foundation class

![UML](https://github.com/dsheiko/xObject/raw/master/doc/uml-overview.png)


## Exampes

### Class-based descending inheritance

```javascript
  var AbstractClass = function() {
        return {
          foo: "value"
        };
      },
      ConcreteClass = function () {
        // Constructor's job
        var _privateMember = "private member";
        return {
            __extends__: AbstractClass
            publicMember : "public member",
            privilegedMethod : function () {
                return _privateMember;
            }
        };
      };

  var obj = xObject.create( ConcreteClass );
  assert.ok( obj instanceof ConcreteClass );
  assert.ok( obj instanceof AbstractClass );
```

### Passing arguments to the constructor

```javascript
var ConcreteClass = function( arg1, arg2 ) {
  var _arg1 = arg1,
      _arg2 = arg2;
  return {
      getArg1 : function () {
          return _arg1;
      },
      getArg2 : function () {
          return _arg2;
      }
  };
};

var obj = xObject.create( ConcreteClass, [ 1, 2 ] );
assert.strictEqual( obj.getArg1(), 1 );
assert.strictEqual( obj.getArg2(), 2 );
```

### Using __constructor__ pseudo-method

```javascript
var ConcreteClass = function() {
    return {
        __constructor__: function( arg1, arg2 ) {
          this.arg1 = arg1;
          this.arg2 = arg2;
        }
    };
  };

  var obj = xObject.create( ConcreteClass, [ 1, 2 ] );
  assert.strictEqual( obj.arg1, 1 );
  assert.strictEqual( obj.arg2, 2 );
```

### Importing properties in Object.create way

```javascript
var ConcreteClass = function() {};
var obj = xObject.create( ConcreteClass, { foo : 'foo' } );
// or xObject.create( ConcreteClass, [], { foo : 'foo' } );
assert.strictEqual( obj.foo, 'foo' );
```

### Using __mixin__ pseudo-property

```javascript
var MixinA = {
    propertyA: "propertyA"
};
MixinB = {
    propertyB: "propertyB"
};
Silo = function() {
    return {
        __mixin__: [ MixinA, MixinB ],
        ownPropery: "Own property"
    }
};

var obj = xObject.create( Silo );
assert.strictEqual( o.ownPropery, "Own property" );
assert.strictEqual( o.propertyA, "propertyA" );
assert.strictEqual( o.propertyB, "propertyB" );
```


### Using __implements__ pseudo-property

```javascript


var InjectedDependency = function() {
  return {
  };
},

ConcreteInterface = {
  requeriedMethod : ["string", InjectedDependency]
},

StrictModule = function() {
  return {
    __implements__: ConcreteInterface,
    requeriedMethod : function() {
    }
  }
};

var dependency = xObject.create( InjectedDependency ),
    module = xObject( StrictModule );

assert.ok( dependency instanceof InjectedDependency );
module.requeriedMethod("a string", dependency); // OK
module.requeriedMethod(555, dependency); // throws a TypeError exception
module.requeriedMethod("a string", {}); // throws a TypeError exception

```



### Design by Contract

```javascript
var ConcreteContract = {
    aMethod : {
        onEntry: [ "number"],
        validators: [function(arg){
            return arg > 10;
        }],
        onExit: "string"
    }
},
EmployedModule = function() {
    return {
        __contract__: ConcreteContract,
        aMethod : function() {
            return "a string";
        }
    }
};
var module = EmployedModule.createInstance();
module.aMethod( 50 ); // OK
module.aMethod( 1 ); // validator fails, RangeError exception is thrown

```

### Extending WidgetAbstract

YUI provides a [sophisticated solution](http://yuilibrary.com/yui/docs/widget/) for keeping Widget objects consistent. xObject borrowed the concepts of base xObject.WidgetAbstract type from which all the Widget objects derived.

A Widget object extending xObject.WidgetAbstract may any of following members:
﻿
* HTML_PARSER - object literal mapping this.node properties to supplied selectors. E.g { title: "#title" } obtains reference to a node of id "title" (in the context of boundingBox) and exposes it in this.node.title.
* renderUi - method responsible for creating and adding the nodes which the widget needs into the document 
* bindUi - method responsible for attaching event listeners which bind the UI to the widget state. 
* syncUI - method responsible for setting the initial state of the UI based on the current state of the widget at the time of rendering.

When xObject.create instantiates a derivative of  xObject.WidgetAbstract it populates node property with node references given in HTML_PARSER and call init, renderUi, bindUi and syncUi methods when any available.

```javascript
(function( $, xObject ) {
    "use strict";
    //  Concrete widget
    Intro = function() {
      return {
        __extends__ : jsa.WidgetAbstract,
        HTML_PARSER : {
          toolbar : 'div.toolbar'
        },
        bindUI : function() {
          this.node.toolbar.find( 'li' ).bind( 'click.intro', $.proxy( this.onClickHandler, this) );
        },
        onClickHandler: function( e ) {
            this.node.boundingBox.attr( 'data-pattern', $( e.target ).data( 'id' ) );
        }
      };
    };
    // Document is ready
    $(document).bind( 'ready.app', function(){
      xObject.create( Intro, { boundingBox: "#intro" } );
    });

})( jQuery, xObject );

```

*Note:*  AbstractWidget obtain nodes from DOM by supplied selector strings by using xObject.querySelectorFn( selector[, context] ) function, which you can override.
When it's not overridden, by default it will rely on VanillaJS querySelector method, but if jQuery available in the global scope it will switch to $().

