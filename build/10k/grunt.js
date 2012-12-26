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
				src : [root + 'lib/<%= pkg.name =>-lib.js'],
				dest : root + 'dist/app/public/lib/<%= pkg.name %>-lib.min.js'
			}
		},
		concat : {
			dist : {
				src : [root + 'lib/*.js'],
				dest : root + 'dist/app/public/lib/<%= pkg.name %>-lib.js'
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

	// default task lulz
	grunt.registerTask('default', 'lint');
};