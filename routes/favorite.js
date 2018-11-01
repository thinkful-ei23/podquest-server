'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();

const Favorite = require('../models/favorite');

module.exports = router;
// require auth
router.use(
  '/',
  passport.authenticate('jwt', { session: false, failWithError: true })
);

router.get('/', (req, res, next) => {
  const userId = req.user.id;
  console.log('userId', userId);
  Favorite.find({userId}).sort({updatedAt: 'desc'})
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  const { feedUrl, guid } = req.body;
  const userId = req.user.id;

  const saveFav = { feedUrl, guid, userId };

  Favorite.create(saveFav)
    .then(results =>
      res.location(`${req.originalUrl}/${results.id}`)
        .status(201)
        .json(results)
    )
    .catch(err => next(err));
});

router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  console.log('id', id);
  const userId = req.user.id;
  console.log('userId', userId);
  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The "id" is not valid');
    err.status = 400;
    return next(err);
  }
  Favorite.findOneAndRemove({_id: id, userId})
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;