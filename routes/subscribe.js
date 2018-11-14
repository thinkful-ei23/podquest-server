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

router.get('/', (req, res, next) => {
	const userId = req.user.id;
	console.info(req.user.id);
	Subscription.find({ userId })
		.then(results => {
			console.info(results);
			res.json(results);
		})
		.catch(err => next(err));
});

router.delete('/', (req, res, next) => {
	const userId = req.user.id;
	console.log(req.body);
	const { title } = req.body;
	let updateSub = { title };

	Subscription.findOneAndRemove({ updateSub, userId })
		.then(() => {
			res.send({ status: 204 });
		})
		.catch(err => {
			next(err);
		});
});

module.exports = router;
