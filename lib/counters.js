module.exports = function(pluginConf, web) {
	var Counter = web.includeModel(pluginConf.pluginPath + '/lib/models/Counter.js');
	this.CounterModel = Counter;

	this.increment = async function(id, cb) {
		let counter = await Counter.increment(id);

		if (!counter) {
			throw new Error("Counter wasn't created during increment:", id);
		}

		if (cb) {
			cb(null, counter.next);
		}

		if (console.isDebug) {
			console.debug('Counter incremented', id, counter.next);
		}

		return counter.next;
		
	};

	this.incrementAndExpire = async function(id, expireInSeconds, cb) {
		let counter = await Counter.increment(id, expireInSeconds);

		if (!counter) {
			throw new Error("Counter wasn't created during incrementAndExpire:", id);
		}

		if (cb) {
			cb(null, counter.next);
		}

		if (console.isDebug) {
			console.debug('Counter incremented and expired', id, counter.next, expireInSeconds);
		}

		return counter.next;
	};

	this.get = async function(id, cb) {
		let counter = await Counter.findOne({id: id}).exec();

		if (!counter) {
			if (cb) {
				cb(new Error("Counter not found. " + id));
			}

			// Breaking! Promise now returns 0 even if it doesn't exist
			return 0;
		}

		if (cb) {
			cb(null, counter.next);
		}

		return counter.next;
	}

	this.set = async function(id, val) {
		let counter = await Counter.findOne({id: id}).exec();
		if (!counter) {
			counter = new Counter({id: id});
		}

		counter.next = val;

		await counter.save();

		return counter;
	}

	this.getCounterObject = async function(id, createIfItDoesntExist) {
		let counter = await Counter.findOne({id: id}).exec();

		if (!counter) {
			if (createIfItDoesntExist) {
				counter = new Counter({id:id});
				await counter.save();
			} else {
				return null;
			}
		}

		return counter;
	}

	this.reset = async function(id) {
		let counter = await Counter.findOne({id: id}).exec();

		if (counter) {
			counter.next = 0;
			await counter.save();
		}

		if (console.isDebug) {
			console.debug('Counter reset ' + id);
		}

		return counter;
	}

	this.resetAll = async function() {
		let counters = await Counter.find({}).exec(); 
		let ps = [];
		for (let counter of counters) {
			counter.next = 0;
			ps.push(counter.save());
		}
		
		await Promise.all(ps);

		console.log('All counters reset.');
	}

	this.removeAll = async function() {
		await Counter.collection.drop();

		console.log('All counters removed.');
	}

	return this;
}