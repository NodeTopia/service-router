'use strict';

/**
 * Routes
 */

let routes = [];


routes.push({
    meta: {
        method: 'POST',
        path: 'add.route',
        version: 1,
        concurrency: 100
    },
    params: {
        route: {type: "string"},
        reference: {type: "string"},
        organization: {type: "string"},
        metricSession: {type: "string"},
        logSession: {type: "string"}
    },
    service: async function (resolve, reject) {

        let ctx = this;
        let data = ctx.data;
        let schema = ctx.schema;
        let routeModel;


        let {route, reference, name, organization, metricSession, logSession} = data;


        try {
            routeModel = await schema.Route.findOne({
                route: route
            })
            if (routeModel) {
                console.log(routeModel)
                return reject(new Error('Route already associated'))
            }
        } catch (err) {
            return reject(err)
        }
        routeModel = new schema.Route({
            route: route,
            name: name,
            reference: reference,
            organization: organization,
            metricSession: metricSession,
            logSession: logSession
        });
        try {
            await routeModel.save();
        } catch (err) {
            return reject(err)
        }

        let frontend = 'frontend:' + route;

        schema.Redis.getDB('router', function (next) {
            var db = this;
            this.rpush(frontend, JSON.stringify({
                id: routeModel._id,
                name: name,
                logSession: logSession,
                metricSession: metricSession,
                virtualHost: route
            }), function () {
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