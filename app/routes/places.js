var express = require('express');
var router = express.Router();

var Place = require('../models/place');

router.delete('/:id', function(req, res) {
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

router.post('/', function(req, res) {
    var place = new Place();
    place.name = req.body.name;
    place.address = req.body.address
    place.phone = req.body.phone;
    place.site = req.body.site;

    if (req.body.location) {
        place.location = {
            type: "Point",
            coordinates: [
                parseFloat(req.body.location.lng),
                parseFloat(req.body.location.lat)
            ]
        };
    }

    place.save(function (err, place) {
        if (err) {
            return res.status(500).send(err.message);
        }

        res.json(place);
    });
});

router.put('/:id', function(req, res) {
    Place.findOne({ '_id' : req.params.id }, function(err, place) {
        if (err) {
            return res.status(500).send(err);
        }

        if (req.body.name) place.name = req.body.name;
        if (req.body.address) place.address = req.body.address;
        if (req.body.phone) place.phone = req.body.phone;
        if (req.body.site) place.site = req.body.site;

        if (req.body.location) {
            place.location = {
                type: "Point",
                coordinates: [
                    parseFloat(req.body.location.lng),
                    parseFloat(req.body.location.lat)
                ]
            };
        }

        var saveCallback = function() {
            place.save(function (err, place) {
                if (err) {
                    return res.status(500).send(err);
                }

                res.json(place);
            });
        };

        if (req.body.forcePlaceUpdate) {
            place.updatePlaceInfo(function(err) {
                if (err) return res.status(500).send(err);

                saveCallback();
            });
        } else {
            saveCallback();
        }
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
