var express = require('express');
var router = express.Router();

var Place = require('../models/place');

/**
 * Middleware protecting API
 * The most basic authentication case.
 */
var auth = function(req, res, next) {
    var secret = process.env.API_SECRET || false;
    var auth = req.get('authorization');

    if (secret && auth) {
        var credentials = new Buffer(
            auth.split(' ').pop(), 'base64'
        ).toString('ascii').split(':');

        if (credentials[0] === 'token' && credentials[1] === secret) {
            return next();
        }
    }

    return res.status('403').send('Access denied');
};

router.delete('/:id', auth, function(req, res) {
    Place.findOne({ 'numId': req.params.id }, function(err, place) {
        if (err) {
            return res.status(500).send(err);
        }

        place.remove();
        res.json(place);
    });
});

router.get('/list', function(req, res) {
    var next = function(places) {
        res.set({'Content-Type': 'application/json; charset=utf-8'});
        res.write(JSON.stringify(places));
        res.end();
    }

    Place.all(function(err, places) {
        if (err) {
            return res.status(500).send(err);
        }

        next(places);
    });
});

router.get('/near', function(req, res) {
    var conditions = {
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [ parseFloat(req.query.lng), parseFloat(req.query.lat) ]
                },
                $maxDistance: 200 * 1000 // 100 km
            }
        }
    };

    Place.find(conditions, function(err, places) {
        if (err) {
            return res.status(500).send(err);
        }

        res.json(places);
    });
});

router.get('/:id', function(req, res) {
    Place.findOne({ 'numId': req.params.id }, function(err, place) {
        if (err) {
            return res.status(500).send(err);
        }

        if (!place) {
            return res.status(404).send('No place with given id');
        }

        res.json(place);
    });
});

var save = function(place, req, res) {
    var data = req.body;

    // Update place id if adress changed
    if ('address' in data && place.address != data.address) {
        place.placeId = null;
    }

    place.numId = 'id' in data ? data.id : place.numId;
    place.name = 'name' in data ? data.name : place.name;
    place.address = 'address' in data ? data.address : place.address;
    place.phone = 'phone' in data ? data.phone : place.phone;
    place.site = 'site' in data ? data.site : place.site;
    place.type = 'type' in data ? data.type : place.type;

    if ('location' in data && data.location) {
        place.location = {
            type: "Point",
            coordinates: [
                parseFloat(data.location.lng),
                parseFloat(data.location.lat)
            ]
        };
    }

    var saveCallback = function(err, place) {
        if (err) {
            return res.status(500).send(err.message);
        }

        res.json(place);
    };

    place.save(saveCallback);
};

router.post('/', auth, function(req, res) {
    save(new Place(), req, res);
});

router.put('/:id', auth, function(req, res) {
    Place.findOne({ 'numId' : req.params.id }, function(err, place) {
        if (err) {
            return res.status(500).send(err);
        }

        if (!place) {
            return res.status(404).send('No place with given id');
        }

        save(place, req, res);
    });
});

router.get('/suggest/:keyword', function(req, res) {
    if (req.params.keyword.length < 3) {
        res.status(400).send('Invalid keyword length');
        return;
    }

    Place.find({address: new RegExp(req.params.keyword, 'i')})
        .limit(10)
        .exec(function(err, places) {
            if (err) {
                return res.status(500).send(err);
            }

            res.json(places);
        });
});

module.exports = router;
