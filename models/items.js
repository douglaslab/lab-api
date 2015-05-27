'use strict';

var debug = require('debug')('items:model');
var util = require('util'); //TODO: util.format can be removed when Node starts supporting string templates

var ItemsModel = function() {
  var ItemModel = require('./schemas/item');
  var ObjectId = require('mongoose').Types.ObjectId;

  var handleError = function(errorCode, err, res) {
    debug(err);
    res.json(errorCode, {error: true, data: (typeof err === 'string') ? err : err.message});
  };

  this.findAll = function(req, res, next) {
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

  this.findOne = function(req, res, next) {
    ItemModel.findById(new ObjectId(req.params.id), (err, item) => {
      if(err) {
        handleError(500, err, res);
      }
      else {
        if(item) {
          res.json(200, {error: false, data: item.toObject()});
        }
        else {
          handleError(404, util.format('Item: %s not found', req.params.id), res);
        }
      }
      return next();
    });
  };

  this.create = function(req, res, next) {
    //verify input is an object
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

  this.update = function(req, res, next) {
    //verify input is an object
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
          handleError(404, util.format('Item: %s not found', req.params.id), res);
        }
        return next();
      }
    });
  };

  this.delete = function(req, res, next) {
    ItemModel.findByIdAndRemove(new ObjectId(req.params.id), (err, item) => {
      if(err) {
        handleError(500, err, res);
      }
      else {
        if(item) {
          res.json(200, {error: false, data: util.format('Item %s deleted successfully', item.id)});
        }
        else {
          handleError(404, util.format('Item: %s not found', req.params.id), res);
        }
      }
      return next();
    });
  };
};

module.exports = new ItemsModel();
