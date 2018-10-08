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

router.post('/', (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  requiredFields.forEach(field => {
    if(!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  });

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

module.exports = router;