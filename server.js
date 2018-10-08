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

// run server

function runServer() {

}

// close server


// start from the terminal
