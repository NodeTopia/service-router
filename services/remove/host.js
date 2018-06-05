'use strict';
const async = require('async');

/**
 * Routes
 */

let routes = [];


routes.push({
    meta: {
        method: 'POST',
        path: 'remove.host',
        version: 1,
        concurrency: 100
    },
    params: {
        route: {type: "string"},
        host: {type: "string"},
        port: {type: "number"}
    },
    service: async function (resolve, reject) {

        let ctx = this;
        let data = ctx.data;
        let schema = ctx.schema;
        let routeModel;


        let {route, host, port} = data;


        try {
            routeModel = await schema.Route.findOne({
                route: route
            })
            if (!routeModel) {
                return reject(new Error('Route not associated'))
            }
        } catch (err) {
            return reject(err)
        }

        let hosts = [];
        for (let [index, hostModel] of routeModel.hosts.entries()) {
            if (hostModel.host === host && hostModel.port === port) {
                routeModel.hosts.splice(index, 1);
                hosts.push(hostModel)
                await hostModel.remove()
            }
        }

        try {
            await routeModel.save();
        } catch (err) {
            return reject(err)
        }

        let frontend = 'frontend:' + route;

        schema.Redis.getDB('router', function (next) {
            let db = this;
            let tasks = [];
            for (let hostModel of hosts) {
                tasks.push(function (next) {
                    db.lrem(frontend, 0, JSON.stringify({
                        id: hostModel._id,
                        name: hostModel.name,
                        host: hostModel.host,
                        port: hostModel.port
                    }), next);
                });
            }
            async.parallel(tasks, function (err) {
                if (err) {
                    return next(err);
                }
                db.lrange(frontend, 0, -1, next);
            });

        }, function (err, result) {
            if (err) {
                reject(err)
            } else {
                resolve({result: result.pop(), model: routeModel})
            }
        });
    },
    events: {}
});


/**
 * Export
 */

module.exports = routes;