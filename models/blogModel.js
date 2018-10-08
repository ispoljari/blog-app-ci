"use strict";

const mongoose = require('mongoose');

// schema to represent a blog post
const postSchema = mongoose.Schema({
  title: {type: String, required: true},
  author: {
    firstName: String,
    lastName: String
  },
  content: {type: String, required: true}
});

postSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

postSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    content: this.title,
    author: this.authorName,
  }
}

const Post = mongoose.model("Posts", postSchema);
module.exports = {Post};