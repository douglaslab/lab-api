'use strict';

var debug = require('debug')('items:model');
//var config = require('../configs');
var mongoose = require('./db');
var ItemSchema = require('./schemas/item');
var ItemModel = mongoose.model('Item', ItemSchema);
var ObjectId = mongoose.Types.ObjectId;

var handleError = function(res, err) {
  debug(err);
  res.json(500, {error: true, data: 'Error occured: ' + err});
};

exports.findAll = function(req, res, next) {
  ItemModel.find({}, (err, items) => {
    if (err) {
      handleError(res, err);
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
    if (err) {
      handleError(res, err);
    }
    else {
      if (item) {
        res.json(200, {error: false, data: item.toObject()});
      }
      else {
        res.json(404, {error: true, data: 'Item: ' + req.params.id + ' not found'});
      }
    }
    return next();
  });
};

exports.create = function(req, res, next) {
  var newItem = new ItemModel(req.body);
  newItem.save((err, item) => {
    if (err) {
      handleError(res, err);
    }
    else {
      res.json(201, {error: false, data: item});
    }
    return next();
  });
};

exports.update = function(req, res, next) {
  var updatedItem = new ItemModel(req.body);
  updatedItem.modified = Date.now();
  ItemModel.findByIdAndUpdate(new ObjectId(req.params.id), updatedItem, (err, item) => {
    if (err) {
      handleError(res, err);
    }
    else {
      if (item) {
        res.json(200, {error: false, data: item});
      }
      else {
        res.json(404, {error: true, data: 'Article: ' + req.params.id + ' not found'});
      }
    }
    return next();
  });
};

exports.delete = function(req, res, next) {
  ItemModel.findByIdAndRemove(new ObjectId(req.params.id), (err, item) => {
    if(err) {
      handleError(res, err);
    }
    else {
      res.json(200, {error: false, data: 'Item ' + item.id + ' deleted successfully'});
    }
    return next();
  });
};
