const express = require('express');
const router = express.Router();
const Subscription = require('../models/subscribe');

router.post('/', (req, res, next) => {
	// console.info('req body', req.body);
	const { title, feedUrl } = req.body;
	const userId = req.user.id;
	const subscription = { title, feedUrl, userId };

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

module.exports = router;
