var express = require('express');
var router = express.Router();
var database = require('../../resources/database');
var _ = require('underscore');
var parsel = require('parsel');

/* GET clients listing. */
router.get('/', ensureAuthenticated, function(req, res) {
    database.getClients(function(err, clients) {
        // Handle errors
        if (err) {
            return res.send(500);
        }

        res.json(clients);
    });
});

/* POST create client */
router.post('/', ensureAuthenticated, function(req, res) {
    var client = req.body;

    client.account.password = parsel.encrypt(process.env.DECRYPTION_KEY, client.account.password);

    database.addClient(client, function(err, records) {
        if (err) {
            console.error(err);
            return res.send(500);
        }

        return res.send(204);
    });
});

/* POST update client */
router.post('/:clientId', ensureAuthenticated, function(req, res) {
    var client = req.body;

    database.updateClient(req.param("clientId"), client, function(err) {
        if (err) {
            return res.send(500);
        }

        // Update was good!
        return res.send(204);
    });
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
