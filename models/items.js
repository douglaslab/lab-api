'use strict';

var debug = require('debug')('items:model');
//var config = require('../configs');
var mongoose = require('./db');
var ItemSchema = require('./schemas/item');
var ItemModel = mongoose.model('Item', ItemSchema);
var ObjectId = mongoose.Types.ObjectId;

var handleError = function(errorCode, err, res) {
  debug(err);
  res.json(errorCode, {error: true, data: (typeof err === 'string') ? err : err.message});
};

exports.findAll = function(req, res, next) {
  ItemModel.find({}, (err, items) => {
    if(err) {
      handleError(500, err, res);
    }
    else {
      var result = items.map(x => x.toObject());
      res.json(200, {error: false, data: result});
    }
    return next();
  });
};

exports.findOne = function(req, res, next) {
  ItemModel.findById(new ObjectId(req.params.id), (err, item) => {
    if(err) {
      handleError(500, err, res);
    }
    else {
      if(item) {
        res.json(200, {error: false, data: item.toObject()});
      }
      else {
        handleError(404, 'Item: ' + req.params.id + ' not found', res);
      }
    }
    return next();
  });
};

exports.create = function(req, res, next) {
  //verify input is a
  if(typeof req.body !== 'object') {
    handleError(400, 'malformed input', res);
    return next();
  }
  var newItem = new ItemModel({properties: req.body});
  newItem.save((err, item) => {
    if(err) {
      handleError(500, err, res);
    }
    else {
      res.json(201, {error: false, data: item.toObject()});
    }
    return next();
  });
};

exports.update = function(req, res, next) {
  if(typeof req.body !== 'object') {
    handleError(400, 'malformed input', res);
    return next();
  }
  ItemModel.findById(new ObjectId(req.params.id), (err, item) => {
    if(err) {
      handleError(500, err, res);
    }
    else {
      if(item) {
        item.modified = Date.now();
        for(let field of Object.keys(req.body)) {
          item.properties[field] = req.body[field];
        }
        item.markModified('properties');
        item.save((err2, newItem) => {
          if(err2) {
            handleError(500, err2, res);
          }
          else {
            res.json(200, {error: false, data: newItem.toObject()});
          }
          return next();
        });
      }
      else {
        handleError(404, 'Article: ' + req.params.id + ' not found', res);
        return next();
      }
    }
  });
};

exports.delete = function(req, res, next) {
  ItemModel.findByIdAndRemove(new ObjectId(req.params.id), (err, item) => {
    if(err) {
      handleError(500, err, res);
    }
    else {
      res.json(200, {error: false, data: 'Item ' + item.id + ' deleted successfully'});
    }
    return next();
  });
};
