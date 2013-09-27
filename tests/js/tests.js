/*
* JSA Test Suit
*
* @package jsa-tests
* @author: sheiko
* @version xObject.js, v 2.0
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* @jscs standard:Jquery
* Code style: http://docs.jquery.com/JQuery_Core_Style_Guidelines
*/
/*jshint sub:true*/
/*global module: false */
(function( global ) {
    var $ = global.jQuery,
        xObject = global.xObject,
        stub = global.stub;

    runTests = function() {
        var WIDGET_BODY_MARKUP = '<div class="wrapper"><p class="subject">Subject</p></div>',
            boundingBox = $('#sandbox'),
            prepareSandBox = function() {
                boundingBox
                    .hide()
                    .html('')
                    .attr( 'class', '' )
                    .append( WIDGET_BODY_MARKUP );
            };

        test( "Checks constructor pseudo-property", function() {
            var obj = xObject.create( stub.TestConstructor.SubType, [ "test" ] );
            ok ( obj.prop === "test", "Constructor specified property is available on derivative object" );
        });

        test( "Checks Object.create compatability", function() {
            var obj = xObject.create( { prop1 : 1 }, { prop2 : 2 } );
            ok ( obj.prop1 === 1 );
            ok ( obj.prop2 === 2 );
        });

        test( "Checks module inheritance", function() {
            var testWidget = xObject.create( stub.ConcreteModule, { boundingBox: boundingBox } );

            ok( testWidget instanceof stub.ConcreteModule,
                "testWidget instanceof stub.ConcreteModule");
            ok( testWidget instanceof stub.AbstractModule,
                "stub.ConcreteModule instanceof stub.AbstractModule");
            ok( testWidget instanceof xObject.WidgetAbstract,
                "stub.ConcreteModule instanceof xObject.WidgetAbstract");
            ok( testWidget instanceof xObject.BaseAbstract,
                "stub.ConcreteModule instanceof xObject.BaseAbstract");

            ok( $.inArray( "concrete-module-initialized", stub.log ) !== -1,
                "Init method of concrete module invoked");

            ok( $.inArray( "concrete-module-rendered", stub.log ) !== -1,
                "RenderUI method of concrete module invoked");

            ok( $.inArray( "concrete-module-bound", stub.log ) !== -1,
                "BindUI method of concrete module invoked");

            ok( $.inArray( "concrete-module-synchronized", stub.log ) !== -1,
                "SyncUI method of concrete module invoked");

            ok( testWidget.inheritedProp !== undefined,
                "Concrete module inherits public properties of abstract module");

            ok( testWidget.inheritedPrivilegedMethod !== undefined &&
                testWidget.inheritedPrivilegedMethod() === "abstract-private-access",
                "Concrete module inherits privileged methods of abstract module");

        });

        test( "Check the behavior derived from WidgetAbstract", function() {
                prepareSandBox();
                xObject.create( stub.TestWidget, { boundingBox: boundingBox } );
                ok( boundingBox.hasClass('init'), "init method invoked" );
                ok( boundingBox.hasClass('renderUi'), "renderUi method invoked" );
                ok( boundingBox.hasClass('syncUi'), "syncUi method invoked" );
                ok( boundingBox.hasClass('wrapperFound'), "HTML_PARSER invoked" );
                ok( boundingBox.hasClass('subjectFound'), "-//-" );
        });

        test( "Check interface implementation", function() {
            try {
                xObject.create( stub.ViolatingModule );
            } catch ( err ) {
                ok( err instanceof TypeError, "If interface implementor does not contain method " +
                    "required by the interface SyntaxError exception is thrown");
            }
            var dependency = xObject.create( stub.InjectedDependency ),
                obj = xObject.create( stub.StrictModule );

            try {
                obj.requeriedMethod( "a string", dependency );
                ok( true, "If method arguments match corresponding type hints, no exception thrown" );
            } catch ( err ) {}

            try {
                obj.requeriedMethod( 555, dependency );
            } catch ( err ) {
                ok( err instanceof TypeError, "If method argument is not of the type " +
                    "provided in type hint string, TypeError exception is thrown");
            }
            try {
                obj.requeriedMethod( "a string", {} );
            } catch ( err ) {
                ok( err instanceof TypeError, "If method argument is not an instance " +
                    "of the class provided in type hint, TypeError exception is thrown");
            }
        });

       test( "Check design by contract implementation", function() {
            var dependency = xObject.create( stub.InjectedDependency ),
                obj = xObject.create( stub.EmployedModule );

            try {
                obj.methodA( 'a string', dependency );
                ok( true, "(By interface of the contract) " +
                    "If method arguments match corresponding type hints, no exception thrown");
            } catch ( err ) {}

            try {
                obj.methodA( 555, dependency );
            } catch ( err ) {
                ok( err instanceof TypeError, "(By interface of the contract) " +
                    "If method argument is not of the type " +
                    "provided in type hint string, TypeError exception is thrown");
            }
            try {
                obj.methodA( "a string", {} );
            } catch ( err ) {
                ok( err instanceof TypeError, "(By interface of the contract) " +
                    "If method argument is not an instance " +
                    "of the class provided in type hint, TypeError exception is thrown");
            }


            try {
                obj.methodB( 555, dependency );
                ok( true, "(By the contract) " +
                    "If method arguments match corresponding type hints, no exception thrown");
            } catch ( err ) {}

            try {
                obj.methodB( [], dependency );
            } catch ( err ) {
                ok( err instanceof TypeError, "(By the contract) " +
                    "If method argument is not of the type " +
                    "provided in type hint string, TypeError exception is thrown");
            }
            try {
                obj.methodB( 1, dependency );
            } catch ( err ) {
                ok( err instanceof RangeError, "(By the contract) " +
                    "If method argument is out of range defined by the validator, " +
                    "RangeError exception is thrown");
            }
            try {
                obj.methodC();
            } catch ( err ) {
                ok( err instanceof TypeError, "(By the contract) " +
                    "If method returns a value which does not match the onExit type hint, " +
                    "TypeError exception is thrown");
            }


        });

        test( "Check mixins implementation", function() {
            var obj = xObject.create( stub.Silo );

            ok( obj.ownPropery !== undefined, "Object still has its internal properties" );
            ok( obj.propertyA !== undefined, "Object obtained properties of mixed in object" );
            ok( obj.propertyB !== undefined, "Object obtained properties of mixed in object" );
        });


        test( "Checks if module members are idependent", function() {
            var testModuleA = xObject.create( stub.ConcreteModule, { boundingBox: boundingBox } ),
                testModuleB = xObject.create( stub.ConcreteModule, { boundingBox: boundingBox } );
                ok( testModuleA.arr.length === 0 );
                testModuleA.arr = [ 1 ];
                ok( testModuleA.arr.length === 1 );
                ok( testModuleB.arr.length === 0 );
        });

    };
    // Document is ready
    $( document ).bind( 'ready.app', runTests );

})( this );
