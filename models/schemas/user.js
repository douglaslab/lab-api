'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var security = require('../security');

var UserSchema = new Schema({
    email: {type: String, required: true, unique: true},
    name: {type: String, require: true},
    school: {type: String},
    company: {type: String},
    password: {type: String, required: true},
    apiKey: {type: String, required: true},
    apiSecret: {type: String, required: true},
    permissionLevel: {type: String, required: true, enum: ['USER', 'MANAGER', 'ADMIN'], default: 'USER'},
    created: {type: Date, default: Date.now},
    modified: {type: Date, default: Date.now}
  }, {
  toObject: {
    transform: (doc, ret) => {
      //remove the _id and __v of every document before returning the result
      delete ret._id;
      delete ret.__v;
      //delete ret.password;
    }
  }
});


UserSchema.methods.validateToken = function(token, timestamp) {
  return security.validateToken(token, this.apiKey, this.apiSecret, timestamp);
};

module.exports = mongoose.model('User', UserSchema);
