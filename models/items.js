'use strict';

var debug = require('debug')('items');
var util = require('util'); //TODO: util.format can be removed when Node starts supporting string templates

var ItemsModel = function() {
  var ItemModel = require('./schemas/item');
  var ObjectId = require('mongoose').Types.ObjectId;

  /**
   * Return error in JSON format
   * @param  {Integer} errorCode HTTP error code
   * @param  {Object} err       Error object - can be a string
   * @param  {Object} res       Response object
   */
  var handleError = function(errorCode, err, res) {
    debug(err);
    res.json(errorCode, {error: true, data: (typeof err === 'string') ? err : err.message});
  };

  /**
   * Turns query string parameters into a list of Mongoose search terms
   * By default, terms are conjunctive (i.e. term1 AND term2 AND...), unless 'operator=or' is specified
   * Search will be case insensitive, unless 'ignorecase=false' is specified
   * @param  {Object} query query string object, containing key and values
   * @return {Object}       Mongoose search object
   */
  var parseQueryParameters = function(query) {
    var operator = '$and';
    var ignoreCase = true;
    var search = {};

    if(query.operator) {
      operator = '$' + query.operator;
      delete query.operator;
    }
    if(query.ignorecase) {
      ignoreCase = query.ignorecase;
      delete query.ignorecase;
    }

    search[operator] = Object.keys(query).map(key => {
      var obj = {};
      obj['properties.' + key] = ignoreCase ? {'$regex': new RegExp(query[key], 'i') } : query[key];
      return obj;
    });
    return search;
  };

  /**
   * Get all items
   * User can provide query parameters to search over properties
   * Query string will be in the form of field1=value1&field2=value2...
   * By default, terms are conjunctive (i.e. term1 AND term2 AND...), unless 'operator=or' is specified
   * Search will be case insensitive, unless 'ignorecase=false' is specified
   * @param  {Object}   req  Request object, containing the query object
   * @param  {[type]}   res  Response object
   * @param  {Function} next next operation
   */
  this.findAll = function(req, res, next) {
    var search = Object.keys(req.query).length > 0 ? parseQueryParameters(req.query) : {};
    ItemModel.find(search, (err, items) => {
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

  /**
   * Finds an item by its id
   * @param  {Object}   req  Request object, containing the id parameter
   * @param  {[type]}   res  Response object
   * @param  {Function} next next operation
   */
  this.findById = function(req, res, next) {
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

  /**
   * Creates a new item
   * @param  {Object}   req  Request object, containing body object with item properties
   * @param  {[type]}   res  Response object
   * @param  {Function} next next operation
   */
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

  /**
   * Updates an existing item
   * @param  {[type]}   req  [description]
   * @param  {Object}   req  Request object, containing body object with item properties
   * @param  {[type]}   res  Response object
   * @param  {Function} next next operation
   */
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

  /**
   * Delete item
   * @param  {Object}   req  Request object, containing item id
   * @param  {[type]}   res  Response object
   * @param  {Function} next next operation
   */
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
