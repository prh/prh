module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        opt: {
            client: {
                "tsMain": "lib",
                "tsTest": "test",

                "jsMainOut": "lib",
                "jsTestOut": "test"
            }
        },

		exec: {
			tsc: "tsc -p ./",
            tsfmt: "tsfmt -r"
		},
        tslint: {
            options: {
                configuration: grunt.file.readJSON("tslint.json")
            },
            files: {
                src: [
                    '<%= opt.client.tsMain %>/**/*.ts',
                    '<%= opt.client.tsTest %>/**/*.ts',
                    '!<%= opt.client.tsMain %>/**/*.d.ts'
                ]
            }
        },
        typedoc: {
            main: {
                options: {
                    module: "<%= ts.options.module %>",
                    out: './docs',
                    name: '<%= pkg.name %>',
                    target: "<%= ts.options.target %>"
                },
                src: [
                    '<%= opt.client.tsMain %>/**/*.ts'
                ]
            }
        },
        clean: {
            clientScript: {
                src: [
                    // client
                    '<%= opt.client.jsMainOut %>/*.js',
                    '<%= opt.client.jsMainOut %>/*.d.ts',
                    '<%= opt.client.jsMainOut %>/*.js.map',
                    // client test
                    '<%= opt.client.jsTestOut %>/*.js',
                    '<%= opt.client.jsTestOut %>/*.js.map',
                    '<%= opt.client.jsTestOut %>/*.d.ts'
                ]
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    timeout: 60000,
                    require: [
                        function () {
                            require('espower-loader')({
                                cwd: process.cwd() + '/' + grunt.config.get("opt.client.jsTestOut"),
                                pattern: '**/*.js'
                            });
                        }
                    ]
                },
                src: [
                    '<%= opt.client.jsTestOut %>/**/*Spec.js'
                ]
            }
        },
        conventionalChangelog: {
            options: {
                changelogOpts: {
                    // conventional-changelog options go here
                    preset: "angular"
             },
             context: {
                    // context goes here
             },
             gitRawCommitsOpts: {
                    // git-raw-commits options go here
             },
             parserOpts: {
                    // conventional-commits-parser options go here
             },
             writerOpts: {
                    // conventional-changelog-writer options go here
             }
            },
            release: {
                src: "CHANGELOG.md"
            }
        }
    });

    grunt.registerTask(
        'default',
        ['exec:tsfmt', 'exec:tsc', 'tslint']);

    grunt.registerTask(
        'test',
        ['default', 'mochaTest']);

    require('load-grunt-tasks')(grunt);
};
