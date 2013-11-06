/**
 * express-slicer
 *
 * Copyright(c) 2013 André König <akoenig@posteo.de>
 * MIT Licensed
 *
 */

'use strict';

var express = require('express'),
    http    = require('http'),
    url     = require('url'),
    slicer  = require('../');

describe('The express-slicer', function () {

    var app = express(),
        host = '127.0.0.1',
        port = 9919;

    // Wrapper around the http GET request
    function get (endpoint, callback) {
        var options = url.parse(endpoint);

        function onResponse (res) {
            var chunks = [];

            res.on('readable', function onReadable () {
                var chunk;

                while ( null !== (chunk = res.read()) ) {
                    chunks.push(chunk);
                }
            })
            .on('error', callback)
            .on('end', function onEnd () {
                return callback(null, JSON.parse(Buffer.concat(chunks).toString()));
            });
        }

        http.get(options, onResponse);
    }

    app.use(slicer());

    app.get('/persons', function list (req, res) {
        var persons = [
            {firstName: 'André', lastName: 'König', email: 'andre.koenig@posteo.de'},
            {firstName: 'Hans', lastName: 'Müller', email: 'hans.mueller@gmail.com'}
        ];

        res.json(200, persons);
    });

    app.get('/persons/:id', function one (req, res) {
        var id = req.params.id,
            persons = {
                '1': {firstName: 'André', lastName: 'König', email: 'andre.koenig@posteo.de'},
                '2': {firstName: 'Hans', lastName: 'Müller', email: 'hans.mueller@gmail.com'}
            };

        res.json(persons[id]);
    });

    app.listen(port, host);

    it('should be able to slice particular attributes from objects in a list', function (done) {
        var endpoint = 'http://' + host + ':' + port + '/persons?fields=firstName,lastName';

        function onResponse (err, persons) {
            if (err) {
                throw err; // Let the test crash if there is an error!
            }

            expect(persons).toBeDefined();
            expect(persons.length).toBe(2);
            expect(persons[0].email).toBeUndefined();
            expect(persons[1].email).toBeUndefined();

            done();
        }

        get(endpoint, onResponse);
    });

    it('should be able to slice particular attributes from one object', function (done) {
        var endpoint = 'http://' + host + ':' + port + '/persons/1?fields=email';

        function onResponse (err, person) {
            if (err) {
                throw err; // Let the test crash if there is an error!
            }

            expect(person).toBeDefined();
            expect(person.email).toBeDefined();
            expect(person.lastName).toBeUndefined();
            expect(person.firstName).toBeUndefined();

            done();
        }

        get(endpoint, onResponse);
    });

});