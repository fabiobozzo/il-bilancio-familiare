module.exports = function(grunt) {
	grunt.initConfig({

		less: {
			production: {
				options: {
					paths: ["public/less"],
					cleancss: true
				},
				files: {"public/stylesheets/build.css": "public/less/all.less"}
			}
		},

		browserify: {
			home: {
				files: { 'public/javascripts/build/home.js': ['public/javascripts/home.js'] }
			},
			app: {
				files: { 'public/javascripts/build/app.js': ['public/javascripts/app.js'] },
				options: { transform: ['node-underscorify'] }
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-browserify');

	grunt.registerTask('default', ['less','browserify']);
};
