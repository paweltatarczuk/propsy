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
    Place.findOne({ '_id': req.params.id }, function(err, place) {
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
    Place.findOne({ '_id': req.params.id }, function(err, place) {
        if (err) {
            return res.status(500).send(err);
        }

        res.json(place);
    });
});

var save = function(place, req, res) {
    place.name = req.body.name;
    place.address = req.body.address
    place.phone = req.body.phone;
    place.site = req.body.site;
    place.type = req.body.type;

    if (req.body.location) {
        place.location = {
            type: "Point",
            coordinates: [
                parseFloat(req.body.location.lng),
                parseFloat(req.body.location.lat)
            ]
        };
    }

    var saveCallback = function(err, place) {
        if (err) {
            return res.status(500).send(err);
        }

        res.json(place);
    };

    place.save(saveCallback);
};

router.post('/', auth, function(req, res) {
    save(new Place(), req, res);
});

router.put('/:id', auth, function(req, res) {
    Place.findOne({ '_id' : req.params.id }, function(err, place) {
        if (err) {
            return res.status(500).send(err);
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
