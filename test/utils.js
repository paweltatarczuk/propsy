'use strict';

var mongoose = require('mongoose');
var fixtures = require('node-mongoose-fixtures');

if (process.env.NODE_ENV != "test") {
    ERROR
}

var utils = module.exports = {};

utils.clear = function(done) {
    for (var i in mongoose.connection.collections) {
        mongoose.connection.collections[i].remove(function() {});
    }

    return done();
};

utils.fixtures = function(data, done) {
    fixtures(data, done);
};
