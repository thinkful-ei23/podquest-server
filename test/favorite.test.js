'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const {app} = require('../server');
const mongoose = require('mongoose');
const {dbConnect,dbDisconnect} = require('../db-mongoose');
const {TEST_DATABASE_URL} = require('../config');
const {User} = require('../models/user');
const Favorite = require('../models/favorite');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config')

const seedUsers = require('../db/seed/users.json');

process.env.NODE_ENV = 'test';

process.stdout.write('\x1Bc\n');

const expect = chai.expect;
chai.use(chaiHttp);



describe('podQuest API - favorite',function(){
    
    let token;
    let user;
    const seedFavorite ={
        title:"newTitle",
        guid:"newGuid",
        feedUrl:"newFeed",
        userId:'000000000000000000000001'
    }
    before(function() {
        return dbConnect(TEST_DATABASE_URL);
      });
    beforeEach(function(){
        return Promise.all([
            User.insertMany(seedUsers),
            Favorite.insertMany(seedFavorite)
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

    describe('/api/favorite ',function(){
        it('Should grab all a users favorites',function(){

            Favorite.find({userId: user.id})
            .then(res =>{
                expect(res).to.be.an('array');
                expect(res[0]).to.be.an('object');
                expect(res[0].title).to.equal(seedFavorite.title)
                expect(res[0].guid).to.equal(seedFavorite.guid)
            })
        });
        it('Should post a new favorite',function(){
            const newFavorite = {
                title:"newTitle",
                guid:"newGuid1",
                feedUrl:"newfeed",
                userId:"000000000000000000000001"
            }
            let res;
            return chai
            .request(app)
            .post('/api/favorite')
            .send(newFavorite)
            .set('Authorization', `Bearer ${token}`)
            .then(_res=>{
                res = _res
                console.log(res.body)
            })            
        })
    })
});