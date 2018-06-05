'use strict';

/**
 * Routes
 */

let routes = [];


routes.push({
    meta: {
        method: 'POST',
        path: 'add.tls',
        version: 1,
        concurrency: 100
    },
    service: async function (resolve, reject) {

        let ctx = this;
        let data = ctx.data;
        let schema = ctx.schema;
        let routeModel;


        let {route, reference, key, certificate} = data;


        try {
            routeModel = await schema.Route.findOne({
                $or: [{route: route}, {reference: reference}]
            })
            if (!routeModel) {
                return reject(new Error('Route not associated'))
            }
        } catch (err) {
            return reject(err)
        }


        let tlsModel = new schema.TLS({
            key: key,
            certificate: certificate
        });

        try {
            await tlsModel.save();
        } catch (err) {
            return reject(err)
        }


        if(routeModel.tls){
            try {
                await routeModel.tls.remove()
            } catch (err) {

            }
        }

        routeModel.tls = tlsModel._id;

        try {
            await routeModel.save()
        } catch (err) {
            return reject(err)
        }


        let frontend = 'tls:' + route;

        schema.Redis.getDB('router', function (next) {
            let db = this;
            db.HMSET(frontend, {
                "key" : key,
                "certificate" : certificate
            }, function(err) {
                if (err) {
                    return next(err);
                }
                db.hgetall(frontend, next);
            });
        }, function (err, result) {
            if (err) {
                reject(err)
            } else {
                resolve({result: result, model: routeModel})
            }
        });
    },
    events: {}
});


/**
 * Export
 */

module.exports = routes;