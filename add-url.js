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

jobs.process('router.add.url', 999, function(job, done) {

	var url = job.data.url;
	var name = job.data.name;
	var organization = job.data.organization;
	var metricSession = job.data.metricSession;
	var logSession = job.data.logSession;

	var frontend = 'frontend:' + url;

	Redis.getDB('router', function(next) {
		var db = this;
		db.lrange(frontend, 0, -1, function(err, items) {
			if (err) {
				return cb(err);
			}
			if (items.length) {
				next();
			} else {

				var job = [];

				job.push(function(next) {
					db.rpush(frontend, organization + '-' + (name || 'other'), next);
				});
				job.push(function(next) {
					db.rpush(frontend, metricSession, next);
				});
				job.push(function(next) {
					db.rpush(frontend, logSession, next);
				});

				async.parallel(job, function(err) {
					if (err) {
						return next(err);
					}
					db.lrange(frontend, 0, -1, next);
				});
			}
		});
	}, done);

});
