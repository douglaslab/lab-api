'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ServiceSchema = new Schema({
  name: {type: String, required: true},
  token: {type: String, required: true},
  optional: {type: String}
});

//no need to create a model, as the schema would be embedded in UserSchema
module.exports = ServiceSchema;
