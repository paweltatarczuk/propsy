var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');
var cache = require('memory-cache');

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
  placeId: String,
  openingHours: String,
  type: String
});
placeSchema.index({ location: '2dsphere' });

placeSchema.pre('save', function(next) {
    var self = this;
    cache.del('places.list');

    if (typeof this.placeId !== 'string') {
        this.updatePlaceInfo(function(err) {
            if (err) return next(new Error(err));
            else return next();
        });
    } else {
        next();
    }
});

/**
 * Get all places using cache
 */
placeSchema.statics.all = function(callback) {
    var places = cache.get('places.list');

    if (places === null) {
        Place.find({}, function(err, places) {
            if (err) {
                return callback(err);
            }

            cache.put('places.list', places);
            callback(null, places);
        });
    } else {
        callback(null, places);
    }
}

// Model
var Place = mongoose.model('Place', placeSchema);

/**
 * Update place info
 */
Place.prototype.updatePlaceInfo = function(callback) {
    var self = this;

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

            if (!self.openingHours) {
                self.openingHours = result.openingHours;
            }
        }

        callback(err);
    });
}

/**
 * Identify place
 */
Place.prototype.retrievePlaceInfo = function(callback) {
    var self = this;
    var request = require('request');

    var uri = 'https://maps.googleapis.com/maps/api/place/' + (this.placeId ? 'details' : 'textsearch') + '/json';
    var params = {
        key: process.env.GOOGLE_API_SERVER_KEY,
        language: 'pl'
    };

    if (this.placeId) {
        params.placeid = this.placeId;
    }
    else {
        if (this.name || this.address) {
            params.query = _.filter([this.name, this.address]).join(' ');
        }

        if (this.location) {
            params.location = this.location.coordinates.join(',');
            params.radius = 50;
        }
    }

    request({ uri: uri, qs: params }, function (error, response, body) {
        if (error || response.statusCode != 200) return callback(error || response.status);

        body = JSON.parse(body);

        if (body.error_message) return callback(body.error_message);

        try {
            var result = body.result ? body.result : body.results[0];

            callback(null, {
                name: result.name,
                address: result.formatted_address,
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                placeId: result.place_id,
                photos: result.photos,
                openingHours: result.opening_hours ? result.opening_hours.weekday_text : ''
            });
        } catch (err) {
            callback('Could not parse place details from Google API.');
        }
    });
};

module.exports = Place;
