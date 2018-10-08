"use strict";

// create express server instance 
const express = require('express');
const app = express();

// setup logging middleware
const morgan = require('morgan');
app.use(morgan('common'));

// import mongoose
const mongoose = require('mongoose');
// use native ES6 promises with mongoose
mongoose.Promise = global.Promise;

// import router
const blogRouter = require('./routes/blogRouter');

// import constants from config.js
const {DATABASE_URL, PORT} = require('./config');

// add body parsing middleware
app.use(express.json());

// route requests
app.use('/posts', blogRouter);

let server;

// run server function

function runServer(databaseUrl, port = PORT) {
 return new Promise((resolve, reject) => {
  mongoose.connect(databaseUrl, err => {
    if (err) {
      return reject(err);
    }
    server = app
      .listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
  });
 });
}

// close server
function closeServer() {
  return mongoose.disconnect().then(()=> {
    return new Promise((resolve, reject) => {
      server.close(err => {
        if (err) {
          return reject(err);
        }
        console.log('Closing server!');
        resolve();
      })
    })
  });
}

// start from the terminal
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};