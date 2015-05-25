'use strict';

var debug = require('debug')('db');
var mongoose = require('mongoose');
var db = require('../configs').db;
mongoose.connect(db.connection);
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.on('open', () => {
  debug('connected to %s', db.name);
});

module.exports = mongoose;
