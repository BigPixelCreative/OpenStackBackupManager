var mongodb = require("mongodb");
var ObjectID = require('mongodb').ObjectID;
var MongoClient = mongodb.MongoClient;
var bcrypt = require('bcryptjs');

var MONGOHQ_URL = process.env.MONGOHQ_URL;

/*
 * @param callback(error, clients)
 *     @param error: error if error occured, null otherwise
 *     @param clients: list of clients
 *
 */
module.exports.getClients = function(callback) {
    MongoClient.connect(MONGOHQ_URL, function(err, db) {
        // Handle errors
        if (err) {
            console.error("Cannot connect to database: " + err);
            return callback(err, null);
        }

        // Got the clients collection
        var collection = db.collection("clients")

        //
        collection.find().toArray(function(err, clients) {
            // Close the DB, as we are done with it
            db.close();

            // Handle errors
            if (err) {
                console.error("Cannot connect to database: " + err);
                return callback(err, null);
            }

            // Send the json data
            callback(null, clients);
        });
    });
};

module.exports.getClient = function(client, callback) {
    MongoClient.connect(MONGOHQ_URL, function(err, db) {
        // Handle errors
        if (err) {
            console.error("Cannot connect to database: " + err);
            return callback(err, null);
        }

        // Got the clients collection
        var clients = db.collection("clients")

        var client_id = null;

        if (typeof client === 'object') {
            if (typeof client._id == 'object') {
                client_id = client._id;
            }
            else {
                client_id = ObjectID(client._id);
            }
        }
        else {
            client_id = ObjectID(client);
        }

        // Find the client
        clients.findOne({ _id: client_id }, function(err, client) {
            // Close the DB, as we are done with it
            db.close();

            // Handle errors
            if (err) {
                console.error("Cannot connect to database: " + err);
                return callback(err, null);
            }

            // Send the json data
            callback(null, client);
        });
    });
};

module.exports.addClient = function(client, callback) {
    MongoClient.connect(MONGOHQ_URL, function(err, db) {
        // Handle errors
        if (err) {
            console.error("Cannot connect to database: " + err);
            return callback(err, null);
        }

        // Got the clients collection
        var collection = db.collection("clients")

        collection.insert(client, {w: 1}, function(err, client) {
            // Close the DB, as we are done with it
            db.close();
            if (err) {
                console.error("Error in adding client: " + err);
                return callback(err, null);
            }

            return callback(null, client);
        });
    });
};

module.exports.updateClient = function(client_id, client, callback) {
    MongoClient.connect(MONGOHQ_URL, function(err, db) {
        // Handle errors
        if (err) {
            console.error("Cannot connect to database: " + err);
            return callback(err, null);
        }

        // Got the clients collection
        var collection = db.collection("clients")

        if (client._id !== null) {
            delete client._id;
        }

        collection.update({ _id: ObjectID(client_id) }, client, function(err) {
            // Close the DB, as we are done with it
            db.close();

            // If an error occured, report it
            if (err) {
                console.error("Error in updating client(" + client_id + "): " + err);
                return callback(err);
            }

            return callback(null);
        });
    });
};

module.exports.getUser = function(user, callback) {
    MongoClient.connect(MONGOHQ_URL, function(err, db) {
        // Handle errors
        if (err) {
            console.error("Cannot connect to database: " + err);
            return callback(err, false);
        }

        // Got the clients collection
        var users = db.collection("users")

        users.findOne(user, function(err, user) {
            // Close the DB, as we are done with it
            db.close();

            if (err) {
                console.error("Cannot lookup user: " + err);
                return callback(err, false);
            }

            return callback(null, user);
        });

    });
}

module.exports.checkLogin = function(username, password, callback) {
    module.exports.getUser({username: username}, function(err, user) {
        if (err) {
            console.error("Cannot lookup user " + username + ": " + err);
            return callback(err);
        }

        if (user == null || typeof user === 'undefined') {
            console.error("User not found: " + username);
            return callback(null, false, null);
        }

        if (bcrypt.compareSync(password, user.password)) {
            return callback(null, true, user);
        }
        else {
            return callback(null, false, null);
        }
    });
};

module.exports.addUser = function(username, password, callback) {
    MongoClient.connect(MONGOHQ_URL, function(err, db) {
        // Handle errors
        if (err) {
            console.error("Cannot connect to database: " + err);

            if (callback !== null) {
                return callback(err, false);
            }
            else {
                throw err;
            }
        }

        db.collection("users")
            .insert({ username: username, password: bcrypt.hashSync(password, 8) }, {w: 1}, function(err, user) {
            // Close the DB, as we are done with it
            db.close();

            if (err) {
                console.error("Error in adding user: " + err);

                if (callback !== null) {
                    return callback(err, false);
                }
                else {
                    throw err;
                }
            }

            if (callback !== null) {
                return callback(null, user);
            }
        });

    });
}

module.exports.getJobs = function(query, callback) {
    MongoClient.connect(MONGOHQ_URL, function(err, db) {
        // Handle errors
        if (err) {
            console.error("Cannot connect to database: " + err);
            return callback(err, null);
        }

        // Got the clients collection
        var collection = db.collection("jobs")

        //
        collection.find(query).toArray(function(err, jobs) {
            // Close the DB, as we are done with it
            db.close();

            // Handle errors
            if (err) {
                console.error("Cannot connect to database: " + err);
                return callback(err, null);
            }

            // Send the json data
            callback(null, jobs);
        });
    });
}

module.exports.createJob = function(job, callback) {
    MongoClient.connect(MONGOHQ_URL, function(err, db) {
        // Handle errors
        if (err) {
            console.error("Cannot connect to database: " + err);
            return callback(err, null);
        }

        // Got the clients collection
        var collection = db.collection("jobs")

        //
        collection.insert(job, {w: 1}, function(err, jobs) {
            // Close the DB, as we are done with it
            db.close();

            // Handle errors
            if (err) {
                console.error("Cannot connect to database: " + err);
                return callback(err, null);
            }

            // Send the json data
            callback(null, jobs[0]);
        });
    });
}

module.exports.removeJob = function(id, callback) {
    MongoClient.connect(MONGOHQ_URL, function(err, db) {
        // Handle errors
        if (err) {
            console.error("Cannot connect to database: " + err);
            return callback(err, null);
        }

        // Got the clients collection
        var collection = db.collection("jobs")

        collection.findOne({ _id: ObjectID(id) }, function(err, job) {
            if (job.status !== 'completed') {
                collection.remove({ _id: ObjectID(id)}, {w:1}, function(err, numberOfRemovedDocs) {
                    // Close the DB, as we are done with it
                    db.close();

                    // Handle errors
                    if (err) {
                        console.error("Cannot connect to database: " + err);
                        return callback(err, null);
                    }

                    // Send the json data
                    callback(null, numberOfRemovedDocs);
                });
            }
            else {
                callback(null, 0);
            }
        });
    });
}
