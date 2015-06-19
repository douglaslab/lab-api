'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PermissionSchema = new Schema({
    element: {type: String, required: true},
    action: {type: String, required: true},
    permissionRequired: {type: String, required: true, enum: ['USER', 'MANAGER', 'ADMIN']},
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

module.exports = mongoose.model('Permission', PermissionSchema);
