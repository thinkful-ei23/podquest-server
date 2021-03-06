const express = require('express');
const router = express.Router();
const Subscription = require('../models/subscribe');

router.post('/', (req, res, next) => {
	// console.info('req body', req.body);
	const { title, feedUrl } = req.body;
	const userId = req.user.id;
	const subscription = { title, feedUrl, userId };

	if (!feedUrl) {
		const err = new Error('Missing feedUrl');
		err.status = 422;
		return next(err);
	}

	if (!title) {
		const err = new Error('Missing title in request');
		err.status = 422;
		return next(err);
	}

	Subscription.create(subscription)
		.then(result =>
			res
				.location(`${req.originalUrl}/${result.id}`)
				.status(201)
				.json(result)
		)
		.catch(err => next(err));
	// res.send('subscription');
});

router.get('/', (req, res, next) => {
	const userId = req.user.id;
	Subscription.find({ userId })
		.then(results => {
			res.json(results);
		})
		.catch(err => next(err));
});

router.delete('/', (req, res, next) => {
	const userId = req.user.id;
	const title = req.body.title;
	Subscription.findOneAndRemove({ title, userId })
		.then(() => {
			res.send({ status: 204 });
		})
		.catch(err => {
			next(err);
		});
});

module.exports = router;
