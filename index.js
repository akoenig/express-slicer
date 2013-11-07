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
function ExpressSlicer () {}

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
    var i = fields.length - 1,
        extract,
        field;

    for (i; i >= 0; i = i - 1) {
        field = fields[i];

        if (obj.hasOwnProperty(field)) {
            // Lazy creation
            if (!extract) {
                 extract = {};
            }

            extract[field] = obj[field];
        }
    }

    // If no field matched, return the full object.
    if (!extract) {
        extract = obj;
    }

    return extract;
};

/**
 * @private
 *
 * The dispatcher function that prepares the slicable object(s).
 *
 * @param {array||object} slicables An array or one single object from which the fields should be extracted.
 * @param {array} fields The fields that should be extracted.
 * @return {array|object} The single sliced object or the array with sliced objects.
 *
 */
ExpressSlicer.prototype.$$slice = function $$slice (slicables, fields) {
    var i;

    fields = fields || '';
    fields = fields.split(',');

    if (!util.isArray(slicables)) {
        slicables = [slicables];
    }

    i = slicables.length - 1;

    for (i; i >= 0; i = i - 1) {
        slicables[i] = this.$$extractFields(slicables[i], fields);
    }

    if (1 === slicables.length) {
        return slicables[0];
    } else {
        return slicables;
    }
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

    // Wraps the express json functionality
    return function json () {

        var args = Array.prototype.slice.call(arguments),
            fields = this.req.query.fields,
            slicable;

        if (2 === args.length) {

            // Is: res.json(slicable, statusCode);
            if ('number' === typeof args[1]) {
                slicable = args[0];

                func.apply(this, [args[1], self.$$slice(slicable, fields)]);

            // Is: res.json(statusCode, slicable);
            } else {
                slicable = args[1];

                func.apply(this, [args[0], self.$$slice(slicable, fields)]);
            }

        // Is: res.json(slicable);
        } else {
            slicable = args[0];

            func.apply(this, [self.$$slice(slicable, fields)]);
        }
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
 * Creates a new ExpressSlicer instance and returns
 * the middleware for ExpressJS.
 *
 * @return {function} Middleware function for ExpressJS.
 *
 */
module.exports = function init () {
    var slicer = new ExpressSlicer();

    return slicer.middleware.bind(slicer);
};