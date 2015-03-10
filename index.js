module.exports = function runOncePlugin(pluginConf, web, next) {
	web.counters = require('./lib/counters.js')(pluginConf, web);
	next();

}