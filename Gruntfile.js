/**
 * express-slicer
 *
 * Copyright(c) 2013 André König <andre.koenig@posteo.de>
 * MIT Licensed
 *
 */

'use strict';

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        jshint: {
            files: ['Gruntfile.js', 'index.js', 'specs/**/*.js'],
            options: {
                node: true,
                strict: true,
                globals: {
                    describe: false,
                    it: false,
                    expect: false,
                    spyOn: false,
                    afterEach: false,
                    beforeEach: false
                }
            }
        },
        'jasmine-node': {
            executable: './node_modules/.bin/jasmine-node'
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jasmine-node');

    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('test', ['lint', 'jasmine_node']);
    grunt.registerTask('default', ['test']);
};