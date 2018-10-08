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

// import constants from config.js
const {DATABASE_URL, PORT} = require('./config');

let server;

// setup a simple GET endpoint
app.get('/', (req, res) => {
  res.status(200).json({hello: 'world'});
});

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


// alternate way of starting the server

// function runServer(databaseUrl, port = PORT) {
//   return new Promise((resolve, reject) => {
//    mongoose.connect(databaseUrl, err => {
//      if (err) {
//        return reject(err);
//      }
//      resolve();
//    });
//   })
//   .then(() => {
//     server = app
//     .listen(port, () => {
//       console.log(`Your app is listening on port ${port}`);
//     })
//   },
//   err => {
//     mongoose.disconnect();
//   });
// }


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

// alternate way 1 of closing the server

// function closeS1() {
//   return new Promise((resolve, reject) => {
//     mongoose.disconnect(() => {
//       server.close(err => {
//         if (err) {
//           return reject(err);
//         }
//         console.log('Closing server!');
//         resolve();
//       })
//     }); 
//   });
// }

// alternate way 2 of closing the server

// function closeS2() {
//   return new Promise((resolve, reject) => {
//     mongoose.disconnect((err) => {
//         if (err) {
//           return reject(err);
//         }
//         resolve();
//       })
//       .then(()=> {
//         server.close();
//       },
//       (err) => {
//         console.error('There has been an error.');
//       });
//   });
// }

// start from the terminal
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}