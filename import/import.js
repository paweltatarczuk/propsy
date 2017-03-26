'use strict';

if (process.argv.length !== 4) {
    console.log('Usage: node import.js <file> <url>');
    return -1;
}

var file = process.argv[2];
var url = process.argv[3];

var fs = require('fs');
var parse = require('csv-parse');
var transform = require('stream-transform');
var request = require('request');
var _ = require('underscore');

var output = [];
var parser = parse({ delimiter: ',', columns: function() { return null; } });
var input = fs.createReadStream(file);

var transformer = transform(function(record, callback) {

    var data = {
        name: record[0] || null,
        address: _.filter([record[1], _.filter([record[2], record[3]]).join(' ')]).join(', ') || null,
        phone: record[4] || null,
        site: record[5] || null,
        location: record[6] ? { lat: record[6].split(',')[0], lng: record[6].split(',')[1] } : null
    };

    request.post(url + '/places', {
        form: data
    }, function(err, response, body) {
        if (err || response.statusCode != 200) {
            console.log('Error importing ' + data.name + ': ' + (err || response.statusCode));
            console.log(body);
            return callback(err || response.statusCode);
        }

        console.log('Imported: ' + data.name);
        callback(null);
    });

}, { parallel: 1 });

input.pipe(parser).pipe(transformer);
