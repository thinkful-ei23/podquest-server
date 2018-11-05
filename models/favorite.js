'use strict';

const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  feedUrl: { type: String, required: true },
  title: { type: String, required: true },
  mediaUrl: { type: String, required: true},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

favoriteSchema.index({ title: 1, userId: 1 }, { unique: true });

favoriteSchema.set('timestamps', true);

favoriteSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  }
});

module.exports = mongoose.model('Favorite', favoriteSchema);