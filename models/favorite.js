'use strict';

const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  feedUrl: { type: String, required: true },
  guid: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

favoriteSchema.set('timestamps', true);

favoriteSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  }
});

module.exports = mongoose.model('Favorite', favoriteSchema);