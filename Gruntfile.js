module.exports = function(grunt) {
	grunt.initConfig({

		less: {
			production: {
				options: {
					paths: ["app/client/less"],
					cleancss: true
				},
				files: {"public/stylesheets/build.css": "app/client/less/all.less"}
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
		}

	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-browserify');

	grunt.registerTask('default', ['less','browserify','jshint']);
};
