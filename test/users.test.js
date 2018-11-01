'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const {app} = require('../server');
const {User} = require('../models/user');
const mongoose = require('mongoose')

const {TEST_DATABASE_URL} = require('../config');
const {dbConnect, dbDisconnect} = require('../db-mongoose');
// const {dbConnect, dbDisconnect} = require('../db-knex');

// Set NODE_ENV to `test` to disable http layer logs
// You can do this in the command line, but this is cross-platform
process.env.NODE_ENV = 'test';

// Clear the console before each run
process.stdout.write('\x1Bc\n');

const expect = chai.expect;
chai.use(chaiHttp);



describe('podQuest API Users',function (){

    before(function() {
        return dbConnect(TEST_DATABASE_URL);
      });
      
        afterEach(function () {
          return mongoose.connection.db.dropDatabase();
        });
      
      after(function() {
        return dbDisconnect();
      });

    const username = 'testUser'
    const password = 'password123'
    const email = 'test@test.com'

    describe('/',function(){
        it('Should create a new user',function(){
            const testUser = {username,password,email}

            let res;
            return chai
            .request(app)
            .post('/api/users')
            .send(testUser)
            .then(_res =>{
                res = _res
                expect(res.body.username).to.equal(testUser.username);
                expect(res.body.email).to.equal(testUser.email);
                return User.findOne({username})
            })
            .then(user => {
                expect(user).to.exist;
                expect(user.id).to.equal(res.body._id);
                expect(user.firstName).to.equal(testUser.firstName);
                return user.validatePassword(password);
            })
            .then(isValid => {
                expect(isValid).to.be.true;
            });
        });
        it('Should reject users with missing username', function () {
            const testUser = { password, email };
            return chai.request(app).post('/api/users').send(testUser)
            .then(res => {
                expect(res).to.have.status(422);
                expect(res.body.message).to.equal('Missing field');
                expect(res.body.reason).to.equal('ValidationError');
                expect(res.body.location).to.equal('username');
            });
        });
        it('Should reject users with missing password',
            function () {
            const testUser = { username, email };
            return chai.request(app).post('/api/users').send(testUser)
            .then(res => {
                expect(res).to.have.status(422);
                expect(res.body.message).to.equal('Missing field');
                expect(res.body.reason).to.equal('ValidationError');
                expect(res.body.location).to.equal('password');
            });
        });
        it('Should reject users with non-string username', function () {
            const testUser = { username: 45, email, password};
            return chai.request(app).post('/api/users').send(testUser)
            .then(res => {
                expect(res).to.have.status(422);
                expect(res.body.reason).to.equal('ValidationError');
                expect(res.body.message).to.equal('Incorrect field type: expected string');
                expect(res.body.location).to.equal('username');
            });
        });
        it('Should reject users with password less than 8 characters', function () {
            const testUser = { username, email, password: '' };
            return chai.request(app).post('/api/users').send(testUser)
            .then(res => {
                expect(res).to.have.status(422);
                expect(res.body.reason).to.equal('ValidationError');
                expect(res.body.message).to.equal('Must be at least 10 characters long');
                expect(res.body.location).to.equal('password');
            });
        });
        it('Should reject users with password greater than 72 characters', function () {
            const tooLongPassword = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyza';
            const testUser = { username, email, password: tooLongPassword };
            return chai.request(app).post('/api/users').send(testUser)
            .then(res => {
                expect(res).to.have.status(422);
                expect(res.body.reason).to.equal('ValidationError');
                expect(res.body.message).to.equal('Must be at most 72 characters long');
                expect(res.body.location).to.equal('password');
            });
        });
        it('Should reject users with duplicate username', function () {
            return User.create({
                username,
                password,
                email
            })
            .then(() =>
                chai.request(app).post('/api/users').send({
                    username,
                    password,
                    email
                })
            )
            .catch(err => {
                if (err instanceof chai.AssertionError) {
                    throw err;
                }
                const res = err.response;
                expect(res).to.have.status(422);
                expect(res.body.reason).to.equal('ValidationError');
                expect(res.body.message).to.equal('Username already taken'
                );
                expect(res.body.location).to.equal('username');
            });
        });
    })
})