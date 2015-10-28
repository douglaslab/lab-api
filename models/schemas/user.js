'use strict';

var mongoose = require('mongoose');
var permissionLevels = require('../../configs/service').entities.permissionLevels;
var Schema = mongoose.Schema;
var Service = require('./service');

var UserSchema = new Schema({
    active: {type: Boolean, required: true, default: true},
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, select: false},
    pin: {type: String, required: true, validate: /^\d{5}$/},
    color: {type: String, default: '#49a5ce'},
    photo: {type: Buffer, default: ''},
    apiKey: {type: String, required: true},
    apiSecret: {type: String, required: true},
    permissionLevel: {type: String, required: true, enum: permissionLevels, default: 'USER'},
    services: [Service],
    created: {type: Date, default: Date.now},
    modified: {type: Date, default: Date.now},
    additional: Schema.Types.Mixed
  }, {
  toObject: {
    transform: (doc, ret) => {
      //remove the _id and __v of every document before returning the result
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.photo; //do not return photo - use getPhoto to get the binary
    }
  }
});

module.exports = mongoose.model('User', UserSchema);
