/*jshint node:true */
module.exports = function(grunt) {

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-jscs");
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks("grunt-contrib-qunit");

  var UMD_HEADER = '/* Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and plain browser loading. */\n' +
        '!function(a,b){"use strict";"function"==typeof define&&define.amd?define(["exports"],b):"undefined"!=typeof exports?b(exports):b(a.esprima={})}(this,function(a){\n',
      UMD_FOOTER = '\na.xObject=xObject});';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        jshintrc: ".jshintrc"
      },
      all: ["./js/source/**/*.js", "./tests/**/*.js"]
    },
    jscs: {
        options: {
            "standard": "Jquery"
        },
        all: ["./js/source"]
    },
    qunit: {
      all: ["tests/index.html"]
    },
    uglify: {
      regular: {
        options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        files: {
          'js/build/xObject.core.min.js': [ 'js/source/xObject.core.js' ],
          'js/build/xObject.widget.min.js': [ 'js/source/xObject.core.js', 'js/source/xObject.widget.js' ],
          'js/build/xObject.mixin.min.js': [ 'js/source/xObject.core.js', 'js/source/xObject.mixin.js' ],
          'js/build/xObject.interface.min.js': [ 'js/source/xObject.core.js', 'js/source/xObject.interface.js' ],
          'js/build/xObject.dbc.min.js': [ 'js/source/xObject.core.js', 'js/source/xObject.dbc.js' ],
          'js/build/xObject.widget-mixin.min.js': [ 'js/source/xObject.core.js', 'js/source/xObject.mixin.js', 'js/source/xObject.widget.js' ],
          'js/build/xObject.min.js': [ 'js/source/xObject.core.js', 'js/source/xObject.mixin.js', 'js/source/xObject.interface.js', 'js/source/xObject.widget.js' ],
        }
      },
      umd: {
        options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n' + UMD_HEADER,
          footer: UMD_FOOTER
        },
        files: {
          'js/build/xObject.core.umd.js': [ 'js/source/xObject.core.js' ],
          'js/build/xObject.widget.umd.js': [ 'js/source/xObject.core.js', 'js/source/xObject.widget.js' ],
          'js/build/xObject.mixin.umd.js': [ 'js/source/xObject.core.js', 'js/source/xObject.mixin.js' ],
          'js/build/xObject.interface.umd.js': [ 'js/source/xObject.core.js', 'js/source/xObject.interface.js' ],
          'js/build/xObject.dbc.umd.js': [ 'js/source/xObject.core.js', 'js/source/xObject.dbc.js' ],
          'js/build/xObject.widget-mixin.umd.js': [ 'js/source/xObject.core.js', 'js/source/xObject.mixin.js', 'js/source/xObject.widget.js' ],
          'js/build/xObject.umd.js': [ 'js/source/xObject.core.js', 'js/source/xObject.mixin.js', 'js/source/xObject.interface.js', 'js/source/xObject.widget.js' ],
        }
      }
    }
  });

  grunt.registerTask("test", ["qunit"]);
  grunt.registerTask("build", ["jshint", "jscs", "qunit", "uglify"]);
  grunt.registerTask("default", ["build"]);

};
