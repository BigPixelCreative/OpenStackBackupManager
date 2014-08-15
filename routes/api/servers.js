var express = require('express');
var router = express.Router();
var database = require('../../resources/database');
var openstack = require('pkgcloud');
var _ = require('underscore');
var passport = require('passport');
var pkgcloud = require('pkgcloud');

/* GET clients server listing. */
router.post('/', ensureAuthenticated, function(req, res) {
    var client = req.body;

    var clientOptions = {
            provider: 'openstack',
            authUrl: client.account.authUrl,
            region: client.account.region,
            username: client.account.userName,
            password: client.account.password
    };

    // Create the client
    var openstackClient = pkgcloud.compute.createClient(clientOptions);

    var serverToJSON = function() {
        return {
            id: this.id,
            name: this.name,
            status: this.status,
            hostId: this.hostId,
            addresses: this.addresses,
            progress: this.progress,
            flavor: this.flavorId,
            image: this.imageId,
            created: this.created,
            updated: this.updated
        };
    };

    openstackClient.getServers(function(err, servers) {
        if (err) {
            console.error(err);
            return res.json(500, err);
        }

        // Add flavor info, even though magic is required to extract it...
        for (var sid in servers) {
            // Assign it to a different var?
            servers[sid].toJSON = serverToJSON;
        }

        // Send it over json
        res.json(servers);
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
