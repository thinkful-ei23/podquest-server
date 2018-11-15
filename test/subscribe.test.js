'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const {app} = require('../server');
const mongoose = require('mongoose');
const {dbConnect,dbDisconnect} = require('../db-mongoose');
const {TEST_DATABASE_URL} = require('../config');
const {User} = require('../models/user');
const Subscribe = require('../models/subscribe')
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config')

const seedUsers = require('../db/seed/users.json');
const seedSubscriptions = require('../db/seed/subscribe.json')


const expect = chai.expect;
chai.use(chaiHttp);



describe('subscribe API - podcast',function(){
    let newSub =     {
        "title":"stuff" ,
        "feedUrl": "www.stuff.com",
        "userId": "1"
    }
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
            let newSub =     {
                "title":"stuff" ,
                "feedUrl": "www.stuff.com",
                "userId": user.userId
            }
            Subscribe.insertMany(newSub)
            token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
        });
    })
    afterEach(function () {
        return mongoose.connection.db.dropDatabase();
    });
      
      after(function() {
        return dbDisconnect();
      });

      it('should return all the subscriptions',function(){
        let res;
        return chai
        .request(app)
        .get('/api/subscribe')
        .set('Authorization', `Bearer ${token}`)
      })

});