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
				src : [root + 'src/app/js/<%= pkg.name %>.js'],
				dest : root + 'dist/app/public/js/<%= pkg.name %>.min.js'
			},
			lib : {
				src : [root + 'tmp/<%= pkg.name %>-lib.js'],
				dest : root + 'dist/app/public/lib/<%= pkg.name %>-lib.min.js'
			}
		},
		concat : {
			lib : {
				src : [root + 'lib/modernizr-2.6.2-respond-1.1.0.min.js', root + 'lib/json2.min.js', root + 'lib/underscore-min.js', root + 'lib/jquery-1.8.3.min.js', root + 'lib/jquery-ui-1.9.2.custom.min.js', root + 'lib/backbone-min.js', root + 'lib/backbone-localStorage-min.js', root + 'lib/date.min.js', root + 'lib/plugins.js', root + 'lib/bootstrap.js'],
				dest : root + 'tmp/<%= pkg.name %>-lib.js'
			},
			// backup task just incase we want to break out the js files apart
			jssrc : {
				src : [root + 'src/app/js/01-Header.js', root + 'src/app/js/02-Declarations.js', root + 'src/app/js/03-Task.js', root + 'src/app/js/04-Tasks.js', root + 'src/app/js/Footer.js'],
				dest : root + 'src/app/js/10k.js'
			}
		},
		cssmin : {
			dist : {
				src : root + 'src/app/css/*.css',
				dest : root + 'dist/app/public/css/<%= pkg.name %>.min.css'
			}
		},
		clean : {
			//hack: there needs to be a way to access pkg.name from here as well, it works as is, but should probably try a different plugin than this grunt-clean
			folder : [root + 'tmp/10k-lib.js']
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
			all : [root + 'test/test.html']
		},
		compass : {
			dev: {
				src : root + 'src/app/scss',
				dest : root + 'src/app/css',
				linecomments : true,
				forcecompile : true,
				debugsass : true
			}
		},
		watch : {
			min : {
				files : '<config:lint.files>',
				tasks : 'min:dist'
			},
			compass : {
				files : [root + 'src/app/scss/*.scss'],
				tasks : ['compass:dev', 'cssmin']
			}
		},
		'jsbeautifier' : {
			files : [root + 'src/app/js/**/*.js', root + 'test/spec/**/*.js'],
			options : {
				"indent_size": 4,
				"indent_char": " ",
				"indent_level": 0,
				"indent_with_tabs": false,
				"preserve_newlines": true,
				"max_preserve_newlines": 10,
				"jslint_happy": false,
				"brace_style": "collapse",
				"keep_array_indentation": false,
				"keep_function_indentation": false,
				"space_before_conditional": true,
				"eval_code": false,
				"indent_case": false,
				"unescape_strings": false
			}
		}
	});

	grunt.loadNpmTasks('grunt-css');
	grunt.loadNpmTasks('grunt-compass');
	grunt.loadNpmTasks('grunt-mocha');
	grunt.loadNpmTasks('grunt-jsbeautifier');
	grunt.loadNpmTasks('grunt-clean');

	// default task lulz
	grunt.registerTask('default', 'concat min cssmin');
};