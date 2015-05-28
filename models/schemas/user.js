'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    email: {type: String, required: true, unique: true},
    name: {type: String, require: true},
    school: {type: String},
    company: {type: String},
    password: {type: String, required: true, select: false},
    apiKey: {type: String, required: true, select: false},
    apiSecret: {type: String, required: true, select: false},
    permissionLevel: {type: String, required: true, enum: ['USER', 'MANAGER', 'ADMIN'], default: 'USER'},
    created: {type: Date, default: Date.now, select: false},
    modified: {type: Date, default: Date.now, select: false}
  }, {
  toObject: {
    transform: (doc, ret) => {
      //remove the _id and __v of every document before returning the result
      delete ret._id;
      delete ret.__v;
    }
  }
});

module.exports = mongoose.model('User', UserSchema);
