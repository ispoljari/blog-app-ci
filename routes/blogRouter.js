"use strict";
const express = require('express');
const router = express.Router();

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
// some code
});


module.exports = router;