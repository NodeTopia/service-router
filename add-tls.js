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

jobs.process('router.add.tls', 999, function(job, done) {

	var url = job.data.url;
	var key = job.data.key;
	var certificate = job.data.certificate;

	var frontend = 'tls:' + url;

	Redis.getDB('router', function(next) {
		var db = this;
		db.HMSET(frontend, {
			"key" : key,
			"certificate" : certificate
		}, function(err) {
			if (err) {
				return next(err);
			}
			db.hgetall(frontend, next);
		});
	}, done);

});
