var nconf = require('nconf');
var async = require('async');

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

jobs.process('router.remove.url', 999, function(job, done) {

	var url = job.data.url;

	var frontend = 'frontend:' + url;

	Redis.getDB('router', function(next) {
		var db = this;

		db.del(frontend, function(err) {
			if (err) {
				return next(err);
			}
			db.lrange(frontend, 0, -1, next);
		});
	}, done);

});
