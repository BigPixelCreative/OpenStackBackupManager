var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var flash = require('connect-flash');
var compression = require('compression');

var fs = require('fs');

var database = require('./resources/database');
var ObjectID = require('mongodb').ObjectID;

var indexRoute = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(compression());
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(flash());

app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'public'), { maxAge: 86400000 }));

app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRoute);
app.use('/api/clients', require('./routes/api/clients'));
app.use('/api/servers', require('./routes/api/servers'));
app.use('/api/jobs', require('./routes/api/jobs'));
app.use('*', indexRoute);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    database.checkLogin(username, password, function(err, login_correct, user) {
        if (err) {
            return done(err);
        }
        else if (user === null || typeof user === 'undefined') {
            return done(null, false, { message: "User not found." });
        }
        else if (login_correct == false) {
            return done(null, false, { message: "Password incorrect." });
        }
        else {
            return done(null, user);
        }
    });
  }
));

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

// passport.deserializeUser(database.getUser);
passport.deserializeUser(function(id, done) {
    database.getUser({ _id: ObjectID(id) }, function(err, user) {
        done(err, user);
    })
});

module.exports = app;
