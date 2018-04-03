module.exports = function(grunt) {

	//loads all grunt tasks specified at the package.json file, also loads time-grunt which needs special require
	//time-grunt task shows how much time has every task used
	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	var versionData = grunt.file.readJSON('version.json');
	var version = versionData.release;
	var build = versionData.build;
	var tags = versionData.submodulesApp;
	var tagsRa = versionData.submodulesRa;

	/* ---------------------------------------- ACCIONES ---------------------------------------- */

	grunt.initConfig({

		// TODO Plugin de copy
		copy: {
			// Copia una de las carpetas de pruebas-copia
			copia: {
				files: [{
					expand: true,
					src: ['pruebas-copia/pruebas1/*'],
					//cwd: 'pruebas-copia',
					dest: 'pruebas/'
				}]
			},
			// Copia todas las carpetas de pruebas-copia
			copiaTodo: {
				files: [{
					expand: true,
					//src: ['**/*', '!**/.git/**', '!**/.git*'],
					src: ['pruebas-copia/pruebas1/*'],
					//cwd: 'app/drupal',
					//dot: true, (?)
					dest: 'pruebas'
				}, {
					expand: true,
					src: ['pruebas-copia/pruebas2/*', 'pruebas-copia/pruebas3/*'],
					//cwd: 'app/custom-modules',
					dest: './'
				}]
			},
			test3:{
				files: [{
					expand: true,
					dot: true,
					cwd: '.tmp',
					src: '**/*',
					dest: 'mobile'
				}]
			}
		},

		// TODO PLugin de clean
		clean: {
			pruebas: ['pruebas/*'],
			full: ['**/*']
		},

		// TODO Plugin de watch
		watch: {
			test: {
				files: ['app/custom-themes/**/*{.js,.css,.php,.info,.json,.info,.module,.inc}', 'app/custom-modules/**/*{.js,.css,.php,.info,.json,.info,.module,.inc}', 'app/default/**/*{.js,.css,.php,.info,.json,.info,.module,.inc}', 'app/clear.php'],
				tasks: ['sync:watch']
			}
		},

		/* -------------------------------- Otros plugins -------------------------------- */

		// Compiles Sass to CSS and generates necessary files if requested
		shell: {
			options: {
				execOptions: {
					maxBuffer: Infinity
				}
			}
		}
	});

/* ---------------------------------------- TASKS ---------------------------------------- */

	grunt.registerTask('clean', 'clean:pruebas');
	grunt.registerTask('buildOne', ['clean:pruebas', 'copy:copia']);
	grunt.registerTask('build', ['clean:pruebas', 'copy:copiaTodo']);
	grunt.registerTask('changeVersion', 'update_json');

	/*
	//this task cleans the mobile folder and installs the development version of drupal, modules, themes and default folder with the configuration
	grunt.registerTask('toby', ['clean:full', 'copy:drupal', 'copy:refresh', 'copy:config', 'build_timestamp:local', 'welcome']);
	//this task listen for changes to the app/custom-modules and app/custom-themes folders to upload the changes to mobile folder
	grunt.registerTask('auto-refresh', ['clean:full', 'copy:drupal', 'copy:refresh', 'copy:config', 'build_timestamp:local', 'watch:test']);
	//this task cleans the custom-modules and custom-themes folders of mobile and copies inside the development version
	grunt.registerTask('refresh', ['clean:refresh', 'copy:refresh']);
	//this task cleans the default folder of mobile and copies inside the development version
	grunt.registerTask('refresh-config', ['clean:config', 'copy:config']);
	//this task builds the prod version of the site and copies it into the mobile folder
	grunt.registerTask('test-site', ['clean:temp', 'copy:build', 'csslint', 'postcss', 'jshint', 'uglify', 'imagemin', 'clean:full', 'build_timestamp:build', 'copy:test', 'copy:config', 'clean:temp']);
	//this task builds the site part of this version inside the builds folder
	grunt.registerTask('build-site', ['checkout-tags', 'update_json', 'clean:temp', 'copy:build', 'clean-themes', 'csslint', 'postcss', 'jshint', 'uglify', 'imagemin', 'build_timestamp:build', 'compress', 'clean:temp']);
	//this task builds the backend part of this version inside the builds folder
	grunt.registerTask('build-ra', ['checkout-tags:ra', 'update_json', 'copy:external']);
	//this task builds the release folder of this version inside the builds folder
	grunt.registerTask('build', ['build-site', 'build-ra']);*/

	// Limpia los themes
	/*grunt.registerTask('clean-themes', function () {
		var theme = grunt.option('theme');
		if(theme){
			grunt.file.expand({ filter: 'isDirectory' }, '.tmp/sites/all/themes/*').forEach(function (dir) {
				var actualTheme = dir.split("/")[dir.split("/").length-1];
				if(theme != actualTheme && actualTheme != "maintheme"){
					grunt.file.delete(dir);
				}
			});
			grunt.config("theme", theme);
		}else{
			grunt.task.run(['clean:temp']);
			grunt.fail.fatal("No theme specified, please run this task with --theme=[your_theme]");
		}
	});*/

	// Recorre y fetchea todos los tags
	grunt.registerTask('checkout-tags', function (option) {
		var theme = grunt.option('theme');
		var current = grunt.option('current');
		var _tags = tags;
		if(typeof option !== 'undefined' && option !== '' && option === 'ra'){
			_tags = tagsRa;
		}
		if(theme){
			if(!current){

				for (var i = 0; i < _tags.length; i++) {
					if(_tags[i].name === 'ra-parent' || _tags[i].name === 'rats-email-templates'){
						grunt.config('shell.' + _tags[i].name, {
							command: ['git fetch', 'cd app/' + _tags[i].name, 'git checkout tags/' + _tags[i].tag, 'mvn clean install'].join(' && ')
						});
					}
					else{
						grunt.config('shell.' + _tags[i].name, {
							command: ['git fetch', 'cd app/' + _tags[i].name, 'git checkout tags/' + _tags[i].tag].join(' && ')
						});
					}
					grunt.task.run(['shell:'+ _tags[i].name]);
				}

			}else{
				for (var i = 0; i < _tags.length; i++) {
					if(_tags[i].name === 'ra-parent' || _tags[i].name === 'rats-email-templates'){
						grunt.config('shell.' + _tags[i].name, {
							command: ['cd app/' + _tags[i].name, 'mvn clean install'].join(' && ')
						});
					}
				}
			}
			grunt.config("theme", theme);
		}else{
			grunt.task.run(['clean:temp']);
			grunt.fail.fatal("No theme specified, please run this task with --theme=[your_theme]");
		}
	});

	// Escribe la versión de version.json en package.json
	grunt.registerTask('update_json', function(){
		var package = grunt.file.readJSON('package.json');
		package.version = version;
		grunt.file.write("package.json", JSON.stringify(package));
	});

	// Actualiza el date de version.json con el date actual
	grunt.registerTask('build_timestamp', function(type){
		var version = grunt.file.readJSON('version.json');
		version.date = new Date().getTime();
		if(type == "local"){
			grunt.file.write("mobile/sites/all/version.json", JSON.stringify(version));
		}else{
			grunt.file.write(".tmp/sites/all/version.json", JSON.stringify(version));
		}
	});
};
