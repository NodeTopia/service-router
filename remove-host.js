var async = require('async');
var nconf = require('nconf');
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

jobs.process('router.remove.host', 999, function(job, done) {

	var urls = job.data.urls;
	var name = job.data.name;
	var host = job.data.host;
	var port = job.data.port;

	var hostURL = 'http://' + host + ':' + port + '-' + (name || 'other');

	async.parallel(urls.map(function(url) {

		var frontend = 'frontend:' + url;
		return function(next) {

			Redis.getDB('router', function(next) {
				var db = this;
				db.lrem(frontend, 0, hostURL, function(err) {
					if (err) {
						return next(err);
					}
					db.lrange(frontend, 0, -1, next);
				});
			}, next);

		};
	}), done);
});
