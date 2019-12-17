'use strict';

/**
 * Routes
 */

let routes = [];


routes.push({
    meta: {
        method: 'POST',
        path: 'info',
        version: 1,
        concurrency: 100
    },
    service: async function (resolve, reject) {

        let ctx = this;
        let data = ctx.data;
        let schema = ctx.schema;
        let routeModel;

        let route = data.route;
        let reference = data.reference;
        let many = data.many;

        try {
            routeModel = await schema.Route[many ? 'find' : 'findOne']({
                $or: [{route: route}, {reference: reference}]
            })
            if (!routeModel) {
                return reject(new Error('Route not associated'))
            }
        } catch (err) {
            return reject(err)
        }
        return resolve(routeModel)
        let frontend = 'frontend:' + route;

        schema.Redis.getDB('router', function (next) {
            this.lrange(frontend, 0, -1, next);
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