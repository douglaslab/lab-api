'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ItemSchema = new Schema({
  version: {type: String, default: '1.0.0'},
  created: {type: Date, default: Date.now},
  modified: {type: Date, default: Date.now},
  properties: Schema.Types.Mixed
});

module.exports = ItemSchema;
