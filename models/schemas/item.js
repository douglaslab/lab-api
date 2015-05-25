'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var baseImageUrl = require('../../configs/').images.baseUrl;

var ItemSchema = new Schema({
    version: {type: String, default: '1.0.0'},
    created: {type: Date, default: Date.now},
    modified: {type: Date, default: Date.now},
    properties: Schema.Types.Mixed
  }, {
  toObject: {
    transform: (doc, ret) => {
      //remove the _id and __v of every document before returning the result
      delete ret._id;
      delete ret.__v;
      //return the object ID
      ret.id = doc._id;
      //convert iamge names to full url
      if(ret.properties && ret.properties.image) {
        ret.properties.image = baseImageUrl + ret.properties.image;
      }
    }
  }
});

module.exports = ItemSchema;
