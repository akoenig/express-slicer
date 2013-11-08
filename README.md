# express-slicer

express-slicer is a middleware for the Express framework which provides the functionality for partial JSON responses based on the `field` attribute in the query string.

[![Build Status](https://travis-ci.org/akoenig/express-slicer.png?branch=master)](https://travis-ci.org/akoenig/express-slicer)

## An example

Let's say you are the proud owner of an API that provides information about all the people in the world. Every human-being do have an incredible amount of personal attributes: first name, last name, age, email address, personal address, bla bla bla. If you design your API in order to deliver all these information on every single request it might be, well, it will be a bottleneck. What if your API could be more flexible and will only deliver the attributes that has been requested? Nice, eh? That is what `express-slicer` will offer to you.

    GET http://host.tld/api/persons?fields=id,lastName,firstName

Response body:

```
[
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
]
```

The middleware can handle array responses as well as single objects:

    GET http://host.tld/persons/1?fields=id,email

Response body:

```
{
    id: 1,
    email: 'andre.koenig@gmail.com'
}
```

## Installation

    npm install express-slicer

## Usage

```javascript

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

// Start your browser: http://127.0.0.1:9090/persons?fields=firstName

```

## Options

express-slicer takes options as an object which will be passed to the middleware initialization.

* `'strict'` *(boolean, default: `true`)*: If true, the comma in the `fields` list will act more like a logical AND operator. Every attribute has to match. If one attribute is undefined the entire object will not be returned or will be removed from the response list. If set to false the entire object will be included (not just the defined attributes).

## Tests

Feel free to clone this repository and do some hackery. In order to run the tests just switch into the project directory, install the development dependencies and execute `npm test`

## Changelog

### Version 0.2.0 (20131107)

- [Feature] Introduced strict mode.

### Version 0.1.0 (20131106)

- Core functionality

## Author

Copyright 2013, [André König](http://iam.andrekoenig.info) (akoenig@posteo.de)
