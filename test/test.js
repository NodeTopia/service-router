let assert = require('assert');
const Jerkie = require('jerkie');

let jerkie = new Jerkie({
    redis: process.env.REDIS_URI
});

let configRoute = {
    route: 'google.com',
    name: 'test',
    organization: 'google',
    metricSession: 'metricSession',
    logSession: 'logSession',
    reference: '5b135425c45cee080beec719'
};
let configHost = {
    route: configRoute.route,
    name: 'web.0',
    host: '127.0.0.1',
    port: 9000
};

describe('add new route', function () {

    it('should return new saved route', async function () {

        let result = await jerkie.call('router.add.route', configRoute);
        assert.equal(result.model.route, configRoute.route);
        assert.equal(result.model.organization, configRoute.organization);
        assert.equal(result.model.name, configRoute.name);
        assert.equal(result.model.route, configRoute.route);
        assert.equal(result.model.metricSession, configRoute.metricSession);
        assert.equal(result.model.logSession, configRoute.logSession);
        assert.equal(result.model.reference, configRoute.reference);
        assert.equal(result.result.length, 1);
    });
    it('should add host', async function () {
        let result = await jerkie.call('router.add.host', configHost);

        assert.equal(result.model.hosts[0].name, configHost.name);
        assert.equal(result.model.hosts[0].host, configHost.host);
        assert.equal(result.model.hosts[0].port, configHost.port);
        assert.equal(result.result.length, 2);
    });
    it('should remove host', async function () {
        let result = await jerkie.call('router.remove.host', configHost);
        assert.equal(result.model.hosts.length, 0);
        assert.equal(result.result.length, 1);
    });
    it('should remove route', async function () {

        let result = await jerkie.call('router.remove.route', configRoute);
        assert.equal(result.result.length, 0);
    });

});
