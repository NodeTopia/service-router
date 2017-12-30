var nconf = require('nconf');

nconf.file({
	file : require('path').resolve(process.argv[2])
});
nconf.env();

/*
 * host functions
 */
require('./add-host');
require('./add-url');
require('./remove-host');
require('./remove-url');
/*
 * tls functions
 */
require('./add-tls');
require('./remove-tls');
/*
 * info functions
 */

require('./info');
