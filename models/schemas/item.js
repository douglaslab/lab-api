'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ItemSchema = new Schema({
    version: {type: String, default: '1.0.0'},
    created: {type: Date, default: Date.now},
    modified: {type: Date, default: Date.now},
    properties: Schema.Types.Mixed
  },
  {
    toObject: {
      transform: (doc, ret) => {
        // remove the _id and __v of every document before returning the result
        ret.id = doc.id;
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

module.exports = ItemSchema;
