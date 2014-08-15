var express = require('express');
var router = express.Router();
var database = require('../../resources/database');
var moment = require('moment');

/* GET jobs */
router.get('/', ensureAuthenticated, function(req, res) {
    database.getJobs({}, function(err, jobs) {
        // Handle errors
        if (err) {
            return res.send(500);
        }

        res.json(jobs);
    });
});

/* GET jobs */
router.get('/status/:status', ensureAuthenticated, function(req, res) {
    database.getJobs({ status: req.param("status") }, function(err, jobs) {
        // Handle errors
        if (err) {
            return res.send(500);
        }

        res.json(jobs);
    });
});

/* POST create job */
router.post('/', ensureAuthenticated, function(req, res) {
    var job = req.body;

    job.created = new Date();
    job.status = "queued";

    // Difference from now and 10 min
    var difference = (Math.floor(moment().minute() / 10) * 10 + 10) - moment().minute();
    // Should be queued at this time
    job.queued_for = moment().add('minutes', difference).second(0).millisecond(0).toDate();

    database.createJob(job, function(err, job) {
        // Handle errors
        if (err) {
            return res.send(500);
        }

        res.json(job);
    })
});

router.delete('/:id', ensureAuthenticated, function(req, res) {
    database.removeJob(req.param("id"), function(err, numberRemovedDocs) {
        // Handle errors
        if (err) {
            return res.send(500);
        }

        res.json(204);
    })
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
