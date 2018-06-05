'use strict';

/**
 * Routes
 */

let routes = [];


routes.push({
    meta: {
        method: 'POST',
        path: 'add.host',
        version: 1,
        concurrency: 100
    },
    params: {
        route: {type: "string", optional: true},
        reference: {type: "string", optional: true},
        name: {type: "string"},
        host: {type: "string"},
        port: {type: "number"}
    },
    service: async function (resolve, reject) {

        let ctx = this;
        let data = ctx.data;
        let schema = ctx.schema;
        let routeModel;


        let {route, reference, name, host, port} = data;


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

        for (let hostModel of routeModel.hosts) {
            if (hostModel.host === host && hostModel.port === port) {
                return reject(new Error('Host already been used'))
            }
        }

        let hostModel = new schema.Host({
            name: name,
            host: host,
            port: port
        });

        try {
            await hostModel.save();
        } catch (err) {
            return reject(err)
        }


        try {
            await schema.Route.update(
                {_id: routeModel._id},
                {$push: {hosts: hostModel._id}}
            );
        } catch (err) {
            return reject(err)
        }

        routeModel.hosts.push(hostModel)

        let frontend = 'frontend:' + route;

        schema.Redis.getDB('router', function (next) {
            var db = this;
            this.rpush(frontend, JSON.stringify({
                id: hostModel._id,
                name: hostModel.name,
                host: hostModel.host,
                port: hostModel.port
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