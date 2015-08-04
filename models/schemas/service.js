'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ServiceSchema = new Schema({
    serviceName: {type: String, required: true},
    token: {type: String, required: true},
    additional: {type: String}
  }, {
  toObject: {
    transform: (doc, ret) => {
      //remove the _id and __v of every document before returning the result
      delete ret._id;
      delete ret.__v;
    }
  }
});

//no need to create a model, as the schema would be embedded in UserSchema
module.exports = ServiceSchema;
