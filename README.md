# express-slicer

An ExpressJS middleware that provides the functionality for partial JSON responses based on the querystring.

    An Example:

        GET http://host.tld/persons?fields=id,lastName,firstName

    Response body:

        {
            id: 1,
            firstName: 'André',
            lastName: 'König'
        },
        {
            id: 2,
            firstName: 'Hans',
            lastName: 'Müller'  
        }

The middleware can handle array responses as well as single objects:

    GET http://host.tld/persons/1?fields=id,email

    Response body:

        {
            id: 1,
            email: 'andre.koenig@gmail.com'
        }

## Installation

    npm install express-slicer

## Usage

    'use strict';

    var express = require('express'),
        slicer = require('express-slicer'),
        app = express();

    app.use(slicer());

    app.get('/persons', function list (req, res) {
        var persons = [
            {firstName: 'André', lastName: 'König', email: 'andre.koenig@posteo.de'},
            {firstName: 'Hans', lastName: 'Müller', email: 'hans.mueller@gmail.com'}
        ];

        res.json(200, persons);
    });

    app.listen(9090);

## Running the tests

Feel free to clone this repository and do some hackery. In order to run the tests just switch into the project directory, install the development dependencies and execute

    npm test

## Author

Copyright 2013, [André König](http://iam.andrekoenig.info) (andre.koenig@posteo.de)

|_|0|_|
|_|_|0|
|0|0|0|