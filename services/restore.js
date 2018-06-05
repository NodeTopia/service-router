'use strict';
const async = require('async');

/**
 * Routes
 */

let routes = [];


routes.push({
    meta: {
        method: 'POST',
        path: 'restore',
        version: 1,
        concurrency: 100
    },
    service: async function (resolve, reject) {

        let ctx = this;
        let data = ctx.data;
        let schema = ctx.schema;
        let routeModels;


        try {
            routeModels = await ctx.schema.Route.find({});
        } catch (err) {
            return reject(err)
        }
        schema.Redis.getDB('router', function (next) {
            let db = this;
            let tasks = [];

            for (let routeModel of routeModels) {
                let frontend = 'frontend:' + routeModel.route;
                tasks.push(function (next) {
                    db.rpush(frontend, JSON.stringify({
                        id: routeModel._id,
                        name: routeModel.name,
                        logSession: routeModel.logSession,
                        metricSession: routeModel.metricSession,
                        virtualHost: routeModel.route
                    }), next);
                });


                for (let hostModel of routeModel.hosts) {
                    tasks.push(function (next) {
                        db.lrem(frontend, 0, JSON.stringify({
                            id: hostModel._id,
                            name: hostModel.name,
                            host: hostModel.host,
                            port: hostModel.port
                        }), next);
                    });
                }
                if(routeModel.tls){
                    tasks.push(function (next) {
                        db.HMSET('tls:' + routeModel.route, {
                            "key" : routeModel.tls.key,
                            "certificate" : routeModel.tls.certificate
                        }, function(err) {
                            if (err) {
                                return next(err);
                            }
                            db.hgetall(frontend, next);
                        });
                    });
                }
            }
            async.parallel(tasks, next);

        }, function (err, result) {
            if (err) {
                reject(err)
            } else {
                resolve(routeModels)
            }
        });

    },
    events: {}
});


/**
 * Export
 */

module.exports = routes;