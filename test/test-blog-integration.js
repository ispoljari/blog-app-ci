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
  console.info('Seeding the database with test data...');
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
  console.warn('Tearing down the database...');
  return mongoose.connection.dropDatabase();
}

describe('Integration tests of the blog app api layer.', function() {
  
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
    it('Should return all existing blog posts', function() {
      // strategy: 
      // 1) GET all posts by making an HTTP req. to server
      // 2) inspect if the response object has the right HTTP status and a min. length of 1
      // 3) retrieve the total number of posts directly from the database
      // 4) compare if the number of posts retrieved directly from the database equals to the number of posts returned in the response object of the HTTP transaction

      let res;
      return chai.request(app)
        .get('/posts')
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body).to.have.lengthOf.at.least(1);
          return Post.countDocuments();
        })
        .then(function(count){
          expect(res.body).to.have.lengthOf(count);
        })
    });

    it('Should return blog posts with required fields', function() {
      // strategy: GET all posts by making an HTTP request tot he server, and ensure they have the right keys

      let firstPostResponse;
      return chai.request(app)
        .get('/posts')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);

          res.body.forEach(function(post) {
            expect(post).to.be.a('object');
            expect(post).to.include.keys('title', 'author', 'content');
          });
          firstPostResponse = res.body[0];
          return Post.findById(firstPostResponse.id); 
        })
        .then(function(firstPostDirect) {
          expect(firstPostResponse.id).to.equal(firstPostDirect.id);

          expect(firstPostResponse.title).to.equal(firstPostDirect.title);

          expect(firstPostResponse.content).to.equal(firstPostDirect.content);

          expect(firstPostResponse.author).to.equal(`${firstPostDirect.author.firstName} ${firstPostDirect.author.lastName}`);
        })
    });
  });

  describe('POST endpoint', function() {
    it('Should add a new blog post', function() {
      const newPost = generatePostData();
      return chai.request(app)
        .post('/posts')
        .send(newPost)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('title', 'author', 'content')
          expect(res.body.title).to.equal(newPost.title);
          expect(res.body.content).to.equal(newPost.content);
          expect(res.body.author).to.equal(`${newPost.author.firstName} ${newPost.author.lastName}`);

          return Post.findById(res.body.id);
        })
        .then(function(post) {
          expect(newPost.title).to.equal(post.title);
          expect(newPost.content).to.equal(post.content);
          expect(newPost.author.firstName).to.equal(post.author.firstName);
          expect(newPost.author.lastName).to.equal(post.author.lastName);
        });
    });
  });

  describe('PUT endpoint', function() {
    it('Should update blog post fields that are sent over HTTP', function() {
      const updateData = {
        title: 'babababab',
        content: 'lalaalalal'
      }

      return Post
        .findOne()
        .then(function(post) {
            updateData.id = post.id;
            return post.id;
        })
        .then(function(id) {
          return chai.request(app)
            .put(`/posts/${id}`)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          return Post.findById(updateData.id)
        })
        .then(function(post) {
          expect(updateData.title).to.equal(post.title);
          expect(updateData.content).to.equal(post.content);
        })
    });
  });

  describe('DELETE endpoint', function() {
    it('Should delete a blog post with the corresponding ID', function() {
      let post;
      return Post
        .findOne()
        .then(function(_post) {
          post = _post;
        })
        .then(function() {
          return chai.request(app)
            .delete(`/posts/${post.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Post.findById(post.id);
        })
        .then(function(_post) {
          expect(_post).to.be.null;
        });
    });
  });
});