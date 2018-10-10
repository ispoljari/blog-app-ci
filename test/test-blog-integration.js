"use strict";

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// import chai.expect
const expect = chai.expect;

// mount chaiHttp middleware
chai.use(chaiHttp);

// import the data model
const {Post} = require('../models/blogModel');

// import app, run & close server
const {app, runServer, closeServer} = require('../server');

// import PATH to the database
const {TEST_DATABASE_URL} = require('../config');

function seedPostData() {
  console.info('seeding restaurant data');
  const seedData = [];

  for (let i=1; i<=10; i++) {
    seedData.push(generatePostData());
  }

  return Post.insertMany(seedData);
}

function generatePostData() {
  return {
    title: faker.lorem.sentence(),
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    },
    content: faker.lorem.paragraph()
  };
}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('blog-app API layer integration tests', function() {
  
  before(function() {
    return runServer(TEST_DATABASE_URL);
  })

  after(function() {
    return closeServer();
  });

  beforeEach(function() {
    return seedPostData();
  })

  afterEach(function() {
    return tearDownDb();
  })

  describe('GET endpoint', function() {
    it('should return all existing restaurants', function() {
      let res;
      return chai.request(app)
        .get('/posts')
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body).to.have.lengthOf.at.least(1);
          return Post.count();
        })
        .then(function(count){
          expect(res.body).to.have.lengthOf(count);
        })
    });
  });
});