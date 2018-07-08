'use strict';

var app = require('../../app');
var request = require('supertest');
var utils = require('../utils');

require('should');
require('should-http');

beforeEach(function (done) {
    utils.clear(done);
});

beforeEach(function (done) {
    utils.fixtures(require('../fixtures/places'), done);
});

describe('routes', function() {
    describe('GET /', function() {
        it('should respond with home page', function(done) {
            request(app)
                .get('/')
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.should.be.html;
                    res.body.should.match(/<div id="map"><\/div>/);
                    done();
                });
        });
    });

    describe('GET /places/list', function() {
        it('should respond with list of places', function(done) {
            request(app)
                .get('/places/list')
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.array;
                    res.body.length.should.equal(2);
                    res.body[0].name.should.eql("Sample restaurant");
                    res.body[1].name.should.eql("Sample bar");
                    done();
                });
        })
    })

    describe('GET /places/near', function() {
        it('should respond with places nearby', function(done) {
            request(app)
                .get('/places/near?lng=51.1150666&lat=17.0551203')
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.array;
                    res.body.length.should.equal(1);
                    res.body[0].name.should.eql("Sample restaurant");
                    done();
                });
        });
    });

    describe('GET /places/:id', function() {
        it('should respond with place with given id', function(done) {
            request(app)
                .get('/places/1')
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.name.should.eql("Sample restaurant");
                    done();
                });
        });
    });

    describe('POST /places', function() {
        it('should respond with access denied', function(done) {
            request(app)
                .post('/places')
                .send({
                    name: "New place",
                    address: "Święty Marcin 1, Poznań"
                })
                .set('Content-Type', 'application/json')
                .end(function(err, res) {
                    res.should.have.status(403);
                    res.should.be.json;
                    done();
                });
        });
    });

    describe('POST /places', function() {
        it('should respond with created place', function(done) {
            request(app)
                .post('/places')
                .send({
                    name: "New place",
                    address: "Święty Marcin 1, Poznań"
                })
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Basic dG9rZW46c2VjcmV0')
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.name.should.eql("New place");
                    done();
                });
        });
    });

    describe('PUT /places/:id', function() {
        it('should respond with access denied', function(done) {
            request(app)
                .put('/places/1')
                .send({
                    name: "New restaurant",
                })
                .set('Content-Type', 'application/json')
                .end(function(err, res) {
                    res.should.have.status(403);
                    res.should.be.json;
                    done();
                });
        });
    });

    describe('PUT /places/:id', function() {
        it('should respond with updated place', function(done) {
            request(app)
                .put('/places/1')
                .send({
                    name: "New restaurant",
                })
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Basic dG9rZW46c2VjcmV0')
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.name.should.eql("New restaurant");
                    done();
                });
        });
    });

    describe('GET /places/suggest/:keyword', function() {
        it('should respond with suggested places', function(done) {
            request(app)
                .get('/places/suggest/warszawa')
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.length.should.equal(1);
                    res.body[0].name.should.eql("Sample bar");
                    done();
                });
        });
    });

});
