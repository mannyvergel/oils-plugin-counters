module.exports = function(pluginConf, web) {
	var Counter = web.includeModel(pluginConf.pluginPath + '/lib/models/Counter.js');
	this.CounterModel = Counter;

	this.increment = function(id, cb) {
		Counter.increment(id, function(err, counter) {

			if (err) {cb(err, null); return;};

			if (!counter) {cb(new Error("Counter not found. " + id),  null); return;}

			cb(null, counter.next);
		})
	};

	this.get = function(id, cb) {
		Counter.findOne({_id: id}, function(err, counter) {
			if (err) {cb(err, null); return;};

			if (!counter) {cb(new Error("Counter not found. " + id),  null); return;}

			cb(null, counter.next);
		});
	}

	this.reset = function(id) {
		Counter.findOne({_id: id}), function(err, counter) {
			if (counter) {
				counter.next = 0;
				counter.save();
			}
			if (console.isDebug) {
				console.debug('Counter reset ' + id);
			}
		}
	}

	this.resetAll = function() {
		Counter.find({}, function(err, counters) {
			for (var i in counters) {
				var counter = counters[i];
				counter.next = 0;
				counter.save();
			}
			console.log('All counters reset.');
		})
	}

	return this;
}