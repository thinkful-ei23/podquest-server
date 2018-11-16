'use strict';

const {app} = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const {dbConnect, dbDisconnect} = require('../db-mongoose');
const {TEST_DATABASE_URL, JWT_SECRET} = require('../config')

const {User} = require('../models/user');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful API - Login', function () {

  let token;
  const email = 'Example@test.com';
  const username = 'exampleUser';
  const password = 'examplePass';

  before(function() {
    return dbConnect(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    return User.hashPassword(password)
      .then(digest => User.create({
        email,
        username,
        password: digest
      }));
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return dbDisconnect();
  });

  describe('CS-Cards /api/auth/login', function () {
    it('Should return a valid auth token', function () {
      return chai.request(app)
        .post('/api/auth/login')
        .send({ username, password })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body.authToken).to.be.a('string');
          const payload = jwt.verify(res.body.authToken, JWT_SECRET);
          expect(payload.user).to.have.property('email');
          expect(payload.user.username).to.deep.equal(username);
        });
    });


    it('Should reject requests with incorrect username', function () {
      return chai.request(app)
        .post('/api/auth/login')
        .send({ username: 'wrongUsername', password: 'password' })
        .then(res => {
          expect(res).to.have.status(401);
          expect(res.error.text).to.equal('Unauthorized')
        });
    });
    it('Should reject requests with no username',function(){
      return chai.request(app)
      .post('/api/auth/login')
      .send({ username: '', password: 'password' })
      .then(res => {
        expect(res).to.have.status(400)
        expect(res.error.text).to.equal('Bad Request')
      });
    });
    it('Should reject requests with wrong password',function(){
      return chai.request(app)
      .post('/api/auth/login')
      .send({ username, password: 'password' })
      .then(res => {
        expect(res).to.have.status(401)
        expect(res.error.text).to.equal('Unauthorized')
      });
    });
    it('Should reject requests with no password',function(){
      return chai.request(app)
      .post('/api/auth/login')
      .send({ username, password: '' })
      .then(res => {
        expect(res).to.have.status(400)
        expect(res.error.text).to.equal('Bad Request')
      });
    });
  });

  describe('/api/refresh', function () {

    it('should reject requests with no credentials', function () {
      return chai.request(app)
        .post('/api/auth/refresh')
        .then(res => {
          expect(res).to.have.status(401);
        });
    });

    it('should reject requests with an invalid token', function () {
      token = jwt.sign({ username, password, email }, 'Incorrect Secret');
      return chai.request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(401);
        });
    });

    it('should reject requests with an expired token', function () {
      token = jwt.sign({ username, password, email }, JWT_SECRET, { subject: username, expiresIn: Math.floor(Date.now() / 1000) - 10 });
      return chai.request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(401);
        });
    });

    it('should return a valid auth token with a newer expiry date', function () {
      const user = { username, email };
      const token = jwt.sign({ user }, JWT_SECRET, { subject: username, expiresIn: '1m' });
      const decoded = jwt.decode(token);

      return chai.request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.been.a('object');
          const authToken = res.body.authToken;
          expect(authToken).to.be.a('string');
          const payload = jwt.verify(authToken, JWT_SECRET);
          expect(payload.user).to.deep.equal({ username, email });
          expect(payload.exp).to.be.greaterThan(decoded.exp);
        });
    });
  });
});