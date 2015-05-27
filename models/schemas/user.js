'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: {type: String, require: true},
  school: {type: String},
  company: {type: String},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  permissionLevel: {type: String, required: true, enum: ['USER', 'MANAGER', 'ADMIN']},
  created: {type: Date, default: Date.now},
  modified: {type: Date, default: Date.now}
});

module.exports = UserSchema;
