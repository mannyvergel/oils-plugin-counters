'use strict';

module.exports = {
	name: 'Counter',
	schema: {
	    id: {type: String, required: true, unique: true, index: true},
	 	  next: {type: Number, default: 1},
	 	  createDt: {type: Date, default: Date.now, required: true},
	 	  expires: {type: Date, expires: 0}
	  },
	 initSchema: function(schema) {
	 	schema.statics.addCount = function(counterId, count, expiry) {
	 		return addCount(this, counterId, count, expiry);
	 	}

	 	// expiry can now be date or duration in seconds
		schema.statics.increment = function(counterId, expiry) {

			return addCount(this, counterId, 1, expiry);
		};

		schema.statics.decrement = function(counterId) {
		  return addCount(this, counterId, -1);
		};

		schema.statics.setCounter = function(counterId, val, expiry) {
			let setOnInsert = null;
	 		if (expiry) {
	 			if (expiry instanceof Date) {
	 				setOnInsert = { expires: expiry};
	 			} else {
	 				const t = new Date();
					t.setSeconds(t.getSeconds() + expiry);
			 		setOnInsert = { expires: t};
	 			}
		 	}
		  return this.findOneAndUpdate({id: counterId}, { $set: { next: val }, $setOnInsert: setOnInsert},
		  	{new: true, upsert: true, useFindAndModify: false, select: {next: 1}}).exec();
		};
	 }
}


function addCount(Counter, counterId, count, expiry) {
	 		let setOnInsert = null;
	 		if (expiry) {
	 			if (expiry instanceof Date) {
	 				setOnInsert = { expires: expiry};
	 			} else {
	 				const t = new Date();
					t.setSeconds(t.getSeconds() + expiry);
			 		setOnInsert = { expires: t};
	 			}
		 	}

		  return Counter.findOneAndUpdate({id: counterId}, { $inc: { next: count }, $setOnInsert: setOnInsert}, 
		  	{new: true, upsert: true, useFindAndModify: false, select: {next: 1}}).exec();
		};