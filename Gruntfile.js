module.exports = function(grunt) {
	grunt.initConfig({

		less: {
			production: {
				options: {
					paths: ["app/client/less"],
					cleancss: true
				},
				files: {
					"public/stylesheets/build.css": "app/client/less/all.less",
					"public/stylesheets/index.css": "app/client/less/index.less",
				}
			}
		},

		cssmin: {
			minify: {
				src: ['public/stylesheets/build.css'],
				dest: 'public/stylesheets/build.css'
			}
		},

		browserify: {
			home: {
				files: { 'public/javascripts/build/home.js': ['app/client/home.js'] }, 
				options: { 
					transform: ['debowerify'] 
				}
			},
			app: {
				files: { 'public/javascripts/build/app.js': ['app/client/app.js'] },
				options: { 
					transform: ['node-underscorify','debowerify'] 
				}
			}
		},

		jshint: {
			all: [
				'Gruntfile.js', 
				'app/client/**/*.js',
				'!app/client/bower_components/**/*.js',
			],
			options: {
				sub: true
			}
		},

		uglify: {
			compile: {
				options: {
					compress: true,
					verbose: true
				},
				files: [{
					src: 'public/javascripts/build/home.js',
					dest: 'public/javascripts/build/home.js'
				}, {
					src: 'public/javascripts/build/app.js',
					dest: 'public/javascripts/build/app.js'
				}]
			}
		},

	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-browserify');

	grunt.registerTask('default', ['less','cssmin','browserify','uglify']);
	grunt.registerTask('dev', ['less','browserify','jshint']);
};
