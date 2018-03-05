module.exports = {
	name: 'Counter',
	schema: {
	    id: {type: String, required: true, unique: true, index: true},
	 	  next: {type: Number, default: 1},
	 	  createDt: {type: Date, default: Date.now, required: true},
	 	  expires: {type: Date, expires: 0}
	  },
	 initSchema: function(schema) {
	 	schema.statics.increment = function (counterId, expireInSeconds, callback) {
	 		var setOnInsert = null;
	 		if (expireInSeconds) {
		 		var t = new Date();
				t.setSeconds(t.getSeconds() + expireInSeconds);
		 		var setOnInsert = { expires: t};
		 	}
		 	
		 	//for some reason, not passing a callback won't increment it
		 	callback = callback || function(){};

		  return this.findOneAndUpdate({id: counterId}, { $inc: { next: 1 }, $setOnInsert: setOnInsert}, 
		  	{new: true, upsert: true, select: {next: 1}}, callback);
		};
	 }
}