var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');

// Schema
var placeSchema = new Schema({
  name: String,
  address: String,
  phone: String,
  site: String,
  photos: [],
  location: {
    type: { type: String },
    coordinates: []
  },
  placeId: String
});
placeSchema.index({ location: '2dsphere' });

placeSchema.pre('save', function(next) {
    var self = this;

    if (typeof this.placeId !== 'string') {
        this.retrievePlaceInfo(function(err, result) {
            if (!err) {
                self.placeId = result.placeId;

                self.location = {
                    type: "Point",
                    coordinates: [ parseFloat(result.lng), parseFloat(result.lat) ],
                };

                self.address = result.address;

                if (!self.name) {
                    self.name = result.name;
                }

                if (!self.photos) {
                    self.photos = [];
                    for (var key in result.photos) {
                        self.photos.push(result.photos[key].photo_reference);
                    }
                }

                next();
            }

            next(new Error(err));
        });
    } else {
        next();
    }
});

// Model
var Place = mongoose.model('Place', placeSchema);

/**
 * Identify place
 */
Place.prototype.retrievePlaceInfo = function(callback) {
    var self = this;
    var request = require('request');

    var params = {
        key: process.env.GOOGLE_API_SERVER_KEY,
        language: 'pl'
    };

    if (this.name || this.address) {
        params.query = _.filter([this.name, this.address]).join(' ');
    }

    if (this.location) {
        params.location = this.location.coordinates.join(',');
        params.radius = 50;
    }

    request({ uri: 'https://maps.googleapis.com/maps/api/place/textsearch/json', qs: params }, function (error, response, body) {
        if (error || response.statusCode != 200) return callback(error || response.status);

        body = JSON.parse(body);

        if (body.error_message) return callback(body.error_message);

        try {
            callback(null, {
                name: body.results[0].name,
                address: body.results[0].formatted_address,
                lat: body.results[0].geometry.location.lat,
                lng: body.results[0].geometry.location.lng,
                placeId: body.results[0].place_id,
                photos: body.results[0].photos
            });
        } catch (err) {
            callback('Could not parse place details from Google API.');
        }
    });
};

module.exports = Place;
