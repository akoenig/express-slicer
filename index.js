/**
 * express-slicer
 *
 * Copyright(c) 2013 André König <akoenig@posteo.de>
 * MIT Licensed
 *
 */

'use strict';

var util = require('util');

/**
 * A slicer middleware for ExpressJS.
 *
 * Extracts data out of response objects and sends them as partial
 * JSON responses (see: http://googlecode.blogspot.de/2010/03/making-apis-faster-introducing-partial.html)
 *
 * Example:
 *
 *     http://host/api/persons?fields=firstName,lastName
 *
 * Returns only objects with the attributes firstName and lastName.
 *
 */
function ExpressSlicer (config) {
    config = config || {};

    config.strict = (undefined === config.strict) ? true : !!config.strict;

    this.$$config = config;
}

/**
 * @private
 *
 * Extracts the respective fields out of a given object.
 *
 * @param {object} obj The object from which the fields should be extracted.
 * @param {array} fields The fields that should be extracted
 *
 * @return {object} The stripped object.
 *
 */
ExpressSlicer.prototype.$$extractFields = function $$extractFields (obj, fields) {
    var i       = (fields.length - 1),
        strict  = this.$$config.strict,
        extract = {},
        field   = '';

    for (i; i >= 0; i = i - 1) {
        field = fields[i];

        if (obj.hasOwnProperty(field)) {
            extract[field] = obj[field];
        }
    }

    if (strict) {

        //
        // Skip the extracted object if we are in strict mode and the property
        // count of the extracted object does not match the field count. Not every
        // attribute was available.
        //
        if (fields.length !== Object.keys(extract).length) {
            extract = undefined;
        }

    } else {

        //
        // If we are not in strict mode and the object is empty
        // then use the entire original object.
        //
        if (!Object.keys(extract).length) {
            extract = obj;
        }

    }

    return extract;
};

/**
 * @private
 *
 * The dispatcher function that prepares the sliceable object(s).
 *
 * @param {array|object} sliceables An array or one single object from which the fields should be extracted.
 * @param {array} fields The fields that should be extracted.
 *
 * @return {array} The array with the sliced objects. Even if there is only one object, it will be an array.
 *
 */
ExpressSlicer.prototype.$$slice = function $$slice (sliceables, fields) {
    var slices = [],
        extract,
        i;

    if (!util.isArray(sliceables)) {
        sliceables = [sliceables];
    }

    i = sliceables.length - 1;

    for (i; i >= 0; i = i - 1) {
        extract = this.$$extractFields(sliceables[i], fields);

        if (extract) {
            slices.push(extract);
        }
    }

    return slices;
};

/**
 * @private
 *
 * Parses the arguments that has been passed to `res.json`.
 * Will return an object with the HTTP status code that should be used
 * for the response and the 'sliceables' data.
 *
 *  {
 *      status: 201,
 *      sliceables: []
 *  }
 * 
 * @return {object} The parsed arguments.
 *
 */
ExpressSlicer.prototype.$$parseArguments = function $$parseArguments () {
    var args = Array.prototype.slice.call(arguments),
        parsed = {};

    //
    // There are several ways to call res.json. This section
    // will determine how the arguments has been passed.
    // 
    if (2 === args.length) {

        // Is: res.json(sliceables, statusCode);
        if ('number' === typeof args[1]) {
            parsed.status = args[1];
            parsed.sliceables = args[0];

        // Is: res.json(statusCode, sliceables);
        } else {
            parsed.status = args[0];
            parsed.sliceables = args[1];
        }

    // Is: res.json(sliceables);
    } else {
        parsed.sliceables = args[0];
    }

    return parsed;
};

/**
 * @private
 *
 * Wrapper that entangles the res.json function of ExpressJs
 *
 * @return {function} The original res.json function from ExpressJS
 *
 */
ExpressSlicer.prototype.$$entangle = function $$entangle (func) {
    var self = this;

    // Wraps the Express json functionality
    return function json () {
        var fields = this.req.query.fields,
            args   = self.$$parseArguments.apply(self, arguments),
            result = [];

        args.status = args.status || 200;

        //
        // No fields defined or the 'sliceables' thingy is not an array nor an object.
        // "Normal" res.json(arguments)
        //
        if (!fields || !(util.isArray(args.sliceables) || 'object' === typeof args.sliceables) ) {
            return func.apply(this, arguments);
        }

        fields = fields.split(',');
        fields = fields.filter(function onFilter (value, index) {
            return fields.indexOf(value) === index;
        }).reverse();

        //
        // Slice the data out of this collection
        //
        result = self.$$slice.apply(self, [args.sliceables, fields]);

        //
        // Okay, the result is empty. Let's create an empty object or an empty
        // array, which should be passed to the response.
        //
        if (!result.length) {
            if (util.isArray(args.sliceables)) {
                result = [];
            } else {
                result = {};
            }
        } else {
            if (1 === result.length && !util.isArray(args.sliceables)) {
                result = result[0];
            }
        }

        //
        // res.json(statusCode, sliceables)
        //
        func.apply(this, [args.status, result]);
    };
};

/**
 * The ExpressJS middleware wrapper
 *
 */
ExpressSlicer.prototype.middleware = function middleware (req, res, next) {
    res.json = this.$$entangle(res.json.bind(res));

    next();
};

/**
 * Creates a new ExpressSlicer instance and returns the middleware for ExpressJS.
 * 
 * Possible configuration
 *
 *     strict: boolean (default: true)
 *     
 *         If true, the comma in the `fields` list will act more like a logical AND operator.
 *         Every attribute has to match. If one attribute is undefined the entire object will not
 *         be returned or will be removed from the response list. If set to false the entire object
 *         will be included (not just the defined attributes).
 *
 * @param {object} config The configuration object.
 *
 * @return {function} Middleware function for ExpressJS.
 *
 */
module.exports = function init (config) {
    var slicer = new ExpressSlicer(config);

    return slicer.middleware.bind(slicer);
};