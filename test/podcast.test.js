'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const {app} = require('../server');
const mongoose = require('mongoose');
const {dbConnect,dbDisconnect} = require('../db-mongoose');
const {TEST_DATABASE_URL} = require('../config');
const {User} = require('../models/user');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config')

const seedUsers = require('../db/seed/users.json');

process.env.NODE_ENV = 'test';

process.stdout.write('\x1Bc\n');

const expect = chai.expect;
chai.use(chaiHttp);



describe('podQuest API - podcast',function(){
    
    let token;
    let user;
    before(function() {
        return dbConnect(TEST_DATABASE_URL);
      });
    beforeEach(function(){
        return Promise.all([
            User.insertMany(seedUsers),
          ])
        .then(([users]) => {
            user = users[0];
            token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
        });
    })
    afterEach(function () {
        return mongoose.connection.db.dropDatabase();
    });
      
      after(function() {
        return dbDisconnect();
      });

    describe('POST',function(){
        it('should return the channel info after getting a xml',function(){
            const feedUrl ='http://strugglebus.libsyn.com/rss'

            let res;
            return chai
            .request(app)
            .post('/api/podcast')
            .set('Authorization', `Bearer ${token}`)
            .send({feedUrl})
            .then(_res=>{
                res = _res
                expect(res.body).to.be.an('object')
                expect(res.body.link).to.be.an('string')
                expect(res.body.image).to.be.an('string')
                expect(res.body.episodes).to.be.an('array')
                expect(res.body.episodes.length).to.be.greaterThan(1)
            })
        });
        it('should return an authorization error after getting a bad token',function(){
            const badToken ='hi how are you doing, didn`t think I would see you here'
            const feedUrl ='http://strugglebus.libsyn.com/rss'

            let res;
            return chai
            .request(app)
            .post('/api/podcast')
            .set('Authorization', `Bearer ${badToken}`)
            .send({feedUrl})
            .then(_res =>{
                res = _res
                console.log(res.body)

                expect(res.body).to.be.an('object')
                expect(res.status).to.equal(401)
                expect(res.body.message).to.equal('Unauthorized')
            })
        })
    })
})