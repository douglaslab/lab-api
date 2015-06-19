'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AuditSchema = new Schema({
    user: {type: String, required: true},
    entity: {type: String, required: true},
    action: {type: String, required: true},
    comment: String,
    created: {type: Date, default: Date.now}
  }, {
  toObject: {
    transform: (doc, ret) => {
      //remove the _id and __v of every document before returning the result
      delete ret._id;
      delete ret.__v;
    }
  }
});

module.exports = mongoose.model('Audit', AuditSchema);
