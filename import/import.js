'use strict';

if (process.argv.length !== 5) {
    console.log('Usage: node import.js <file> <url> <token>');
    return -1;
}

var file = process.argv[2];
var url = process.argv[3];
var token = process.argv[4];

var fs = require('fs');
var parse = require('csv-parse');
var transform = require('stream-transform');
var request = require('request');
var _ = require('underscore');

var output = [];
var columns = ['id', 'name', 'address', 'postal', 'city', 'country', 'phone', 'url', 'latlng', 'type']
var parser = parse({ delimiter: ',', columns: columns });
var input = fs.createReadStream(file);

var parseType = function(type) {
    if (type == 'Restauracje, kawiarnie, puby') {
        return 'restaurant';
    }

    if (type == 'Sklepy i inne') {
        return 'shop';
    }

    if (type == 'Hotele, Apartamenty, Schroniska') {
        return 'hotel';
    }

    return 'other';
};

var init = true;
var transformer = transform(function(record, callback) {
    if (init) {
        init = false;
        return callback(null);
    }

    var data = {
        id: record['id'] || null,
        name: record['name'] || null,
        address: _.filter([record['address'], _.filter([record['postal'], record['city']]).join(' '), record['country']]).join(', ') || null,
        phone: record['phone'] || null,
        site: record['url'] || null,
        location: record['latlng'] ? { lat: record['latlng'].split(',')[0], lng: record['latlng'].split(',')[1] } : null,
        type: parseType(record['type'] || null)
    };

    // Try to find place with given id
    request.get(url + '/places/' + record['id'], function(err, response, body) {
        if (err) {
            return callback(err);
        }

        if (response.statusCode == 200) {
            request.put(url + '/places/' + record['id'], {
                form: data,
                auth: { user: 'token', pass: token }
            }, function(err, response, body) {
                if (err) {
                    console.log('Error updating ' + data.name + ': ' + err);
                    return callback(null);
                }

                if (response.statusCode != 200) {
                    console.log('Error updating ' + data.name + ': Unexpected error: ' + response.body);
                    return callback(null);
                }

                console.log('Updated: ' + data.name);
                callback(null);
            });
        }

        else if (response.statusCode == 404) {
            request.post(url + '/places', {
                form: data,
                auth: { user: 'token', pass: token }
            }, function(err, response, body) {
                if (err) {
                    console.log('Error importing ' + data.name + ': ' + err);
                    return callback(null);
                }

                if (response.statusCode != 200) {
                    console.log('Error importing ' + data.name + ': Unexpected error: ' + response.body);
                    return callback(null);
                }

                console.log('Imported new: ' + data.name);
                callback(null);
            });
        }

        else {
            console.log('Error importing ' + data.name + ': Unexpected status code: ' + response.statusCode);
            callback(null);
        }
    });

}, { parallel: 1 });

input.pipe(parser).pipe(transformer);
