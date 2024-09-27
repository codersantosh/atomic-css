module.exports = function (grunt) {
	'use strict';

	grunt.initConfig({
		//basic setting and info about plugins
		pkg: grunt.file.readJSON('package.json'),

		// Setting folder templates.
		// dirs: {
		//     normalCss: 'css/', //<%= dirs.cssNormal %>
		//     minimalCss: 'css-minimal/', //<%= dirs.cssMinimal %>
		//     sass: 'scss/' //<%= dirs.sass %>
		// },

		//sass
		sass: {
			maxCSS: {
				option: {
					style: 'expanded',
					noCache: false,
					sourceMap: process.env.NODE_ENV !== 'production',
				},
				files: {
					'css-max/atomic-max.css': ['scss/grid-max.scss'],
					'demo/colormode-globalstyle/dynamic.css': [
						'demo/colormode-globalstyle/scss/dynamic.scss',
					],
					'demo/colormode-globalstyle/colormode-globalstyle.css': [
						'demo/colormode-globalstyle/colormode-globalstyle.scss',
					],
				},
			},
			normalCss: {
				option: {
					style: 'expanded',
					noCache: false,
				},
				files: {
					'css/atomic.css': ['scss/grid.scss'],
				},
			},
		},
		postcss: {
			options: {
				map: true,
				processors: [
					require('autoprefixer')({
						overrideBrowserslist: ['last 5 versions'],
					}),
				],
			},
			maxCSS: {
				src: 'css-max/*.css',
			},
			normalCss: {
				src: 'css/*.css',
			},
		},
		//css minify
		cssmin: {
			maxCSS: {
				files: {
					'css-max/atomic-max.min.css': 'css-max/atomic-max.css',
					'css-max/atomic-max-rtl.min.css': 'css-max/atomic-max-rtl.css',
				},
			},
			normalCss: {
				files: {
					'css/atomic.min.css': 'css/atomic.css',
					'css/atomic-rtl.min.css': 'css/atomic-rtl.css',
				},
			},
		},
		flipcss: {
			maxCSS: {
				files: {
					'css-max/atomic-max-rtl.css': 'css/atomic-max.css',
				},
			},
			normalCss: {
				files: {
					'css/atomic-rtl.css': 'css/atomic.css',
				},
			},
		},
		cssbeautifier: {
			files: [
				'css-max/atomic-max.css',
				'css-max/atomic-max-rtl.css',
				'css/atomic.css',
				'css/atomic-rtl.css',
				'colormode-globalstyle/colormode-globalstyle.css',
				'colormode-globalstyle/dynamic.css',
			],
		},

		//grunt watch
		watch: {
			css: {
				files: [
					'scss/**/*.scss',
					'colormode-globalstyle/**/*.scss',
					'theme/base/**/*.scss',
				],
				tasks: ['sass', 'cssmin', 'notify_hooks', 'postcss', 'cssbeautifier'],
			},

			options: {
				reload: true,
			},
		},

		copy: {
			deploy: {
				src: [
					'**',
					'!.*',
					'!*.md',
					'!*.map',
					'!.*/**',
					'!.sass-cache',
					'!Gruntfile.js',
					'!package.json',
					'!package-lock.json',
					'!node_modules/**',
					'!npm-debug.log',
					'!assets/css/**',
					'!assets/scss/**',
					'!assets/js/*.map',
					'!assets/library/acme-grid/*.map',
					'!src',
					'!*.zip',
					'!deploy',
					'!phpcs.xml.dist',
				],
				dest: 'deploy/<%= pkg.name %>',
				expand: true,
				dot: true,
			},
		},

		// This is optional!
		notify_hooks: {
			options: {
				enabled: true,
				max_jshint_notifications: 2, // maximum number of notifications from jshint output
				title: 'Css Compiled', // defaults to the name in package.json, or will use project directory's name
				success: true, // whether successful grunt executions should be notified automatically
				duration: 1, // the duration of notification in seconds, for `notify-send only
			},
		},
	});

	//load plugins

	// Load NPM tasks to be used here
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-notify');
	grunt.loadNpmTasks('grunt-flipcss');
	grunt.loadNpmTasks('grunt-postcss');
	grunt.loadNpmTasks('@lodder/grunt-postcss');
	grunt.loadNpmTasks('grunt-cssbeautifier');

	// Register tasks
	grunt.registerTask('default', [
		'sass',
		'postcss',
		'cssbeautifier',
		'cssmin',
		'flipcss',
	]);
	grunt.registerTask('deploy', ['sass', 'flipcss', 'cssmin', 'copy:deploy']);
	grunt.task.run('notify_hooks');
};
