'use strict';

/**
 * Routes
 */

let routes = [];


routes.push({
    meta: {
        method: 'POST',
        path: 'add.redis',
        version: 1,
        concurrency: 100
    },
    service: async function (resolve, reject) {

        let ctx = this;
        let data = ctx.data;
        let schema = ctx.schema;
        let redis;

        let {
            type,
            host,
            port,
            auth,
            master,
        } = data

        try {
            redis = await schema.Redis.findOne({
                type: type,
                host: host,
                port: port,
                auth: auth,
                master: master
            })
            if (redis) {
                return reject(new Error('redis ' + type + ' already used'))
            }
        } catch (err) {
            return reject(err)
        }

        redis = new schema.Redis({
            master: master,
            auth: auth,
            host: host,
            port: port,
            type: type
        });

        try {
            await redis.save();
        } catch (err) {
            return reject(err);
        }
        resolve(redis)
    },
    events: {}
});


/**
 * Export
 */

module.exports = routes;