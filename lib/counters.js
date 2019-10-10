'use strict';

const path = require('path');

module.exports = function(pluginConf, web) {
	const self = {};

	var Counter = web.includeModel(pluginConf.counterModelPath 
		|| path.join(pluginConf.pluginPath, '/lib/models/Counter.js'));

	self.CounterModel = Counter;

	self.increment = async function(id, cb) {
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

	self.decrement = async function(id) {
		let counter = await Counter.decrement(id);

		if (!counter) {
			throw new Error("Counter wasn't created during decrement:", id);
		}

		if (console.isDebug) {
			console.debug('Counter decremented', id, counter.next);
		}

		return counter.next;
	};

	self.incrementAndExpire = async function(id, expireInSeconds, cb) {
		let counter = await Counter.increment(id, expireInSeconds);

		if (!counter) {
			throw new Error("Counter wasn't created during incrementAndExpire:", id);
		}

		if (cb) {
			cb(null, counter.next);
		}

		if (console.isDebug) {
			console.debug('Counter', id, 'incremented', counter.next, 'and expired (s)', expireInSeconds);
		}

		return counter.next;
	};

	self.get = async function(id, cb) {
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

	self.set = async function(id, val) {
		let counter = await Counter.setCounter(id, val);

		if (!counter) {
			throw new Error("Counter wasn't created during set:", id);
		}

		if (console.isDebug) {
			console.debug('Counter set', id, counter.next);
		}

		return counter.next;
	}

	self.getCounterObject = async function(id, createIfItDoesntExist) {
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

	self.reset = async function(id) {
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

	self.resetAll = async function() {
		let counters = await Counter.find({}).exec(); 
		let ps = [];
		for (let counter of counters) {
			counter.next = 0;
			ps.push(counter.save());
		}
		
		await Promise.all(ps);

		console.log('All counters reset.');
	}

	self.removeAll = async function() {
		await Counter.collection.drop();

		console.log('All counters removed.');
	}

	self.remove = async function(...ids) {
		if (!ids) {
			console.warn("Nothing to remove");
			return;
		}

		for (let id of ids) {
			let counter = await Counter.findOne({id: id}).exec();
			if (counter) {
				await counter.remove();
				await counter.save();
			}

			console.log("Counter removed", id);	
		}
		
	}

	return self;
}