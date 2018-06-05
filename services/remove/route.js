'use strict';

/**
 * Routes
 */

let routes = [];


routes.push({
    meta: {
        method: 'POST',
        path: 'remove.route',
        version: 1,
        concurrency: 100
    },
    params: {
        route: {type: "string"}
    },
    service: async function (resolve, reject) {

        let ctx = this;
        let data = ctx.data;
        let schema = ctx.schema;
        let routeModel;


        let {route} = data;


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

        for (let host of routeModel.hosts) {
            try {
                await host.remove()
            }catch (err) {
                //
            }
        }

        if(routeModel.tls){
            try {
                await routeModel.tls.remove()
            }catch (err) {
                //
            }
        }

        try {
            await routeModel.remove()
        }catch (err) {
            //
        }
        let frontend = 'frontend:' + route;

        schema.Redis.getDB('router', function (next) {
            var db = this;
            db.del(frontend, function (err) {
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