module.exports = {
	name: 'Counter',
	schema: {
	    _id: {type: String, required: true, unique: true, index: true},
	 	next: {type: Number, default: 1}
	  },
	 initSchema: function(schema) {
	 	schema.statics.increment = function (counter, callback) {
		    return this.findByIdAndUpdate(counter, { $inc: { next: 1 } }, {new: true, upsert: true, select: {next: 1}}, callback);
		};
	 }
}