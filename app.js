'use strict';

/*
 * Express Dependencies
 */
var express = require('express');
var compression = require('compression');
var compressible = require('compressible');
var bodyParser = require('body-parser');
var app = module.exports = express();
var port = 3000;
var mongoose = require('mongoose');
var Place = require('./app/models/place');

/*
 * Use Handlebars for templating
 */
var exphbs = require('express-handlebars');
var hbs;

// Enforce domain
if (process.env.SITE_URL) {
    app.use(require('express-force-domain')(process.env.SITE_URL));
}

// For application/x-www-form-urlencoded body
app.use(bodyParser.urlencoded({ extended: false }));

// For application/json body
app.use(bodyParser.json());

// For gzip compression
app.use(compression({ filter: function() { return true; }}));

/*
 * Config for Production and Development
 */
app.engine('handlebars', exphbs({
    // Default Layout and locate layouts and partials
    defaultLayout: 'main',
    layoutsDir: 'app/views/layouts/',
    partialsDir: 'app/views/partials/'
}));

// Locate the views
app.set('views', __dirname + '/app/views');

// Locate the public files
app.use(express.static(__dirname + '/public'));

// Set Handlebars
app.set('view engine', 'handlebars');

/*
 * Routes
 */
var router = express.Router();

// Index Page
router.get('/', function(request, response, next) {
    response.render('index', {
        googleApiKey: process.env.GOOGLE_API_CLIENT_KEY,
        googleAnalyticsKey: process.env.GOOGLE_ANALYTICS_KEY || 'UA-XXXXX-X'
    });
});

app.use(router);

// Places
app.use('/places', require('./app/routes/places'));

/**
 * Mongoose
 */
var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
                replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };

mongoose.connect(process.env.MONGO_URL, options);

/**
 * Bind mongoose connection error
 */
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

/*
 * Start it up
 */
if (!module.parent) {
    // Build cache
    console.log('Building places cache');
    Place.all(function(err) {
        if (err) {
            return console.error('Building places cache failed');
        }
        console.log('Places cache built');

        app.listen(process.env.PORT || port);
        console.log('Express started on port ' + port);
    });
}
