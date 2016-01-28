'use strict';

/*
 * Express Dependencies
 */
var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');
var app = express();
var port = 3000;
var mongoose = require('mongoose');

/*
 * Use Handlebars for templating
 */
var exphbs = require('express-handlebars');
var hbs;

// For application/x-www-form-urlencoded body
app.use(bodyParser.urlencoded({ extended: false }));

// For application/json body
app.use(bodyParser.json());

// For gzip compression
// app.use(compression);

/*
 * Config for Production and Development
 */
app.engine('handlebars', exphbs({
    // Default Layout and locate layouts and partials
    defaultLayout: 'main',
    layoutsDir: 'views/layouts/',
    partialsDir: 'views/partials/'
}));

// Locate the views
app.set('views', __dirname + '/views');

// Locate the assets
app.use(express.static(__dirname + '/assets'));

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
app.use('/places', require('./routes/places'));

/**
 * Mongoose
 */
mongoose.connect(process.env.MONGO_URL);

/*
 * Start it up
 */
app.listen(process.env.PORT || port);
console.log('Express started on port ' + port);
