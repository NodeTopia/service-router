const Jerkie = require('jerkie');
const path = require('path');


let service = new Jerkie({
    redis: process.env.REDIS_URI,
    name: 'router',
    schema: path.resolve(__dirname, './schema'),
    services: path.resolve(__dirname, './services'),
    methods: {},
    start: async function () {

    },
    stop: function () {

    }
});
service.start();