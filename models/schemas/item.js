'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ItemSchema = new Schema({
    version: {type: String, default: '1.0.0'},
    properties: Schema.Types.Mixed,
    created: {type: Date, default: Date.now, select: false},
    modified: {type: Date, default: Date.now, select: false}
  }, {
  toObject: {
    transform: (doc, ret) => {
      //remove the _id and __v of every document before returning the result
      delete ret._id;
      delete ret.__v;
      //return the object ID
      ret.id = doc._id;
    }
  }
});

module.exports = mongoose.model('Item', ItemSchema);
