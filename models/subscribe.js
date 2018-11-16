const mongoose = require('mongoose');

const subscribeSchema = new mongoose.Schema({
	title: { type: String, require: true},
	feedUrl: { type: String, require: true },
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

subscribeSchema.set('autoIndex', false);
subscribeSchema.index({ title: 1, userId: 1 }, { unique: true });


subscribeSchema.set('toObject', {
	virtuals: true,
	versionKey: false,
	transform: (doc, ret) => {
		delete ret._id;
	}
});

module.exports = mongoose.model('Subscribe', subscribeSchema);
