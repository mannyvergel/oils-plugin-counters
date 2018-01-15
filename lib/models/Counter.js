module.exports = {
	name: 'Counter',
	schema: {
	    _id: {type: String, required: true, unique: true, index: true},
	 	  next: {type: Number, default: 1},
	 	  createDt: {type: Date, default: Date.now, required: true},
	 	  expires: {type: Date, expires: 0}
	  },
	 initSchema: function(schema) {
	 	schema.statics.increment = function (counter, expireInSeconds, callback) {
	 		var setOnInsert = null;
	 		if (expireInSeconds) {
		 		var t = new Date();
				t.setSeconds(t.getSeconds() + expireInSeconds);
		 		var setOnInsert = { expires: t};
		 	}
		  return this.findByIdAndUpdate(counter, { $inc: { next: 1 }, $setOnInsert: setOnInsert}, {new: true, upsert: true, select: {next: 1}}, callback);
		};
	 }
}