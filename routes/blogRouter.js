"use strict";
const express = require('express');
const router = express.Router();

// init app server
const app = express();

// import mongoose
const mongoose = require('mongoose');

// use native ES6 promises with mongoose
mongoose.Promise = global.Promise;

// import data model
const {Post} = require('../models/blogModel');

// READ all posts
router.get('/', (req, res) => {
  Post
  .find()
  .then(posts => {
    res.json(posts.map(post => post.serialize())
    );
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
});

// READ post with certain ID
router.get('/:id', (req, res) => {
  Post
  .findById(req.params.id)
  .then(post => 
    res.json(post.serialize())
  )
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
});

// CREATE post

function validateRequiredFields(req, res, requiredFields, location) {
  for (let i=0; i<requiredFields.length; i++) {
    if(!(requiredFields[i] in location)) {
      const message = `The required field ${requiredFields[i]} is missing from the request body`
      console.error(message);
      res.status(400).send(message);
    }
  }
}

router.post('/', (req, res) => {
  // check if all of the required fields are sent in the request
  validateRequiredFields(req, res, ['title', 'content', 'author'], req.body);

  // check if the author field contains the first and last name
  validateRequiredFields(req, res, ['firstName', 'lastName'], req.body.author);

  Post.create({
    title: req.body.title,
    content: req.body.content,
    author: {
      firstName: req.body.author.firstName,
      lastName: req.body.author.lastName
    }
  })
  .then(post =>
    res.status(201).json(post.serialize())  
  )
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error!'});
  })
});

// UPDATE posts
router.put('/:id', (req, res) => {
  if (req.params.id !== req.body.id) {
    const message = `Request path id ${req.params.id} and request body id ${req.body.id} must match`;
    console.error(message);
    return res.status(400).json({message: message});
  }

  const toUpdate = {};
  const updateableFields = ['title', 'content', 'author'];

  updateableFields.forEach(field => {
    if ((field in req.body)) {
      if (field === 'author') {
        validateRequiredFields(req, res, ['firstName', 'lastName'], req.body.author);
      }
      toUpdate[field] = req.body[field];
    }

    Post
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .then(post => res.status(200).end())
    .catch(err => {
      console.error(err);
      res.status(500).json({
      message: 'Internal server error!'
      });
    });
  });
});

// DELETE post
router.delete('/:id', (req, res) => {
  Post
  .findByIdAndRemove(req.params.id)
  .then((post) => res.status(204).end())
  .catch(err => res.status(500).json({
    message: 'Internal server error'
  }))
});

// catch-all endpoint if client makes request to non-existent endpoint
app.use("*", function(req, res) {
  res.status(404).json({ message: "Not Found" });
});

module.exports = router;