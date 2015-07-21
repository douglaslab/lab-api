'use strict';

var mongoose = require('mongoose');
var permissionLevels = require('../../configs/service').entities.permissionLevels;
var Schema = mongoose.Schema;
var Service = require('./service');

var UserSchema = new Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, select: false},
    name: {type: String, require: true},
    school: {type: String},
    company: {type: String},
    apiKey: {type: String, required: true},
    apiSecret: {type: String, required: true},
    permissionLevel: {type: String, required: true, enum: permissionLevels, default: 'USER'},
    services: [Service],
    created: {type: Date, default: Date.now, select: false},
    modified: {type: Date, default: Date.now, select: false}
  }, {
  toObject: {
    transform: (doc, ret) => {
      //remove the _id and __v of every document before returning the result
      delete ret._id;
      delete ret.__v;
      delete ret.password;
    }
  }
});

module.exports = mongoose.model('User', UserSchema);
