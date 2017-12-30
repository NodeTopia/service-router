var nconf = require('nconf');
var async = require('async');
var path = require('path');

/*
 *Setup mongodb store
 */
var mongoose = require('nodetopia-model').start(nconf.get('mongodb'));

var Redis = mongoose.Redis;

/*
 *Setup Kue jobs
 */
var kue = require('nodetopia-kue');
var jobs = kue.jobs;

jobs.process('router.info', 999, function(job, done) {

	var url = job.data.url;

	var frontend = 'frontend:' + url;

	Redis.getDB('router', function(next) {
		this.lrange(frontend, 0, -1, next);
	}, done);
});
