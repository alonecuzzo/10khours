/*global module:false*/
module.exports = function(grunt) {
	var path = require('path');
	var root = path.normalize('../../');

	grunt.initConfig({
		pkg : '<json:package.json>',
		meta : {
			banner: '/* <%= pkg.name %>\n' +
                '* <%= pkg.homepage %> \n' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %>' +
                ' <%= pkg.author.name %>\n' +
                '* Licensed under AGPLv3. */'
		},
		lint : {
			files : ['grunt.js', root + '/src/app/**/*.js', root + '/tests/app/**/*.js']
		},
		min : {
			dist : {
				src : [root + 'src/app/js/10khours.js'],
				dest : root + 'dist/app/public/js/<%= pkg.name %>.min.js'
			},
			lib : {
				src : [root + 'tmp/<%= pkg.name %>-lib.js'],
				dest : root + 'dist/app/public/lib/<%= pkg.name %>-lib.min.js'
			}
		},
		concat : {
			lib : {
				src : [root + 'lib/modernizr-2.6.2-respond-1.1.0.min.js', root + 'lib/json2.min.js', root + 'lib/underscore-min.js', root + 'lib/jquery-1.8.3.min.js', root + 'lib/jquery-ui-1.9.2.custom.min.js', root + 'lib/backbone-min.js', root + 'lib/backbone-localStorage-min.js', root + 'lib/date.min.js', root + 'lib/plugins.js'],
				dest : root + 'tmp/<%= pkg.name %>-lib.js'
			}
		},
		cssmin : {
			dist : {
				src : root + 'src/app/css/*.css',
				dest : root + 'dist/app/public/css/<%= pkg.name %>.min.css'
			}
		},
		jshint : {
			options : {
				curly : true,
				eqeqeq : true,
				immed : true,
				latedef : true,
				newcap : true,
				noarg : true,
				sub : true,
				undef : true,
				boss : true,
				eqnull : true,
				browser : true
			},
			globals : {
				require : true,
				define : true,
				requirejs : true,
				describe : true,
				expect : true,
				it : true,
				Backbone : true,
				_ : true,
				$ : true,
				console : true
			}
		},
		mocha : {
			all : [root + 'tests/index.html']
		},
		watch : {
			files : '<config:lint.files>',
			tasks : 'min'
		}
	});

	grunt.loadNpmTasks('grunt-css');
	grunt.loadNpmTasks('grunt-mocha');
	grunt.loadNpmTasks('grunt-clean');

	// default task lulz
	grunt.registerTask('default', 'concat min');
};