'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');
const passport = require('passport');
const { localStrategy, jwtStrategy } = require('./passport/strategies');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const podcastRouter = require('./routes/podcast');
const favoriteRouter = require('./routes/favorite');
const subscribeRouter = require('./routes/subscribe');

// const {dbConnect} = require('./db-knex');

const app = express();

app.use(
	morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
		skip: (req, res) => process.env.NODE_ENV === 'test'
	})
);

app.use(
	cors({
		origin: CLIENT_ORIGIN
	})
);

app.use(express.json());
passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', {
	session: false,
	failWithError: true
});

// Mounting routes
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/podcast', jwtAuth, podcastRouter);
app.use('/api/favorite', jwtAuth, favoriteRouter);
app.use('/api/subscribe', jwtAuth, subscribeRouter);

/*=======Custom 404 Not Found route handler=======*/
app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

/*==========Custom Error Handler==========*/
app.use((err, req, res, next) => {
	if (err.status) {
		const errBody = Object.assign({}, err, { message: err.message });
		res.status(err.status).json(errBody);
	} else {
		console.error(err);
		res.status(500).json({ message: 'Internal Server Error' });
	}
});

function runServer(port = PORT) {
	const server = app
		.listen(port, () => {
			console.info(`App listening on port ${server.address().port}`);
		})
		.on('error', err => {
			console.error('Express failed to start');
			console.error(err);
		});
}

if (require.main === module) {
	dbConnect();
	runServer();
}

module.exports = { app };
