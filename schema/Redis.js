const Jerkie = require('jerkie');

const mongoose = Jerkie.mongoose;
const Schema = mongoose.Schema;

var async = require('async');
var redis = require('redis');

var RedisSchema = new Schema({
    master : {
        type : Boolean
    },
    auth : {
        type : String
    },
    host : {
        type : String
    },
    port : {
        type : Number
    },
    type : {
        type : String
    }
});

RedisSchema.statics.getDB = function(type, next, cb) {
    this.find({
        master : true,
        type : type
    }, function(err, rediss) {
        if (err) {
            return cb(err);
        }
        var dbs = [];

        async.parallel(rediss.map(function(server) {
            var db = redis.createClient(server.port, server.host);
            db.on('connect', function() {
                //console.log('redis connected', type, server.port, server.host);
            });
            db.on('error', function(error) {
                console.log('error', error);
            });
            db.on('end', function() {
                //console.log('end', type, server.port, server.host);
            });
            if (server.auth) {
                db.auth(server.auth);
            }

            if (server.db) {
                //db.select(server.db);
            }

            dbs.push(db);

            return next.bind(db);
        }), function(err, result) {
            async.parallel(dbs.map(function(db) {
                return db.quit.bind(db);
            }), function() {
                cb(err, result);
            });

        });

    });
};

module.exports = mongoose.model('Redis', RedisSchema);