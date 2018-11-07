const express = require('express');
const router = express.Router();
const Subscription = require('../models/subscribe');

router.post('/', (req, res, next) => {
	console.info('req body', req.body);
	const userId = req.user.id;
	res.send('subscription');
});

module.exports = router;
