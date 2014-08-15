var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res) {
    res.render('index', { title: 'OpenStack Backup Manager' });
});

/* GET login page. */
router.get('/login', function(req, res) {
  res.render('login', { title: 'OpenStack Backup Manager', message: req.flash('error') });
});

router.post('/login',  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}

module.exports = router;
