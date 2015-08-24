'use strict';

const ELEMENT = 'ITEM';
var debug = require('debug')('items');
var helper = require('./modelHelper');
var util = require('util'); //TODO: util.format can be removed when Node starts supporting string templates

/**
 * @class ItemsModel
 * @classdesc model for items management
 */
var ItemsModel = function() {
  var ItemModel = require('./schemas/item');

  /**
   * Turns query string parameters into a list of Mongoose search terms<br>
   * @memberof ItemsModel
   * By default, terms are conjunctive (i.e. term1 AND term2 AND...), unless 'operator=or' is specified<br>
   * Search will be case insensitive, unless 'ignorecase=false' is specified
   *
   * @param  {Object} query query string object, containing key and values
   * @return {Object}       Mongoose search object
   */
  var parseQueryParameters = function(req) {
    let operator = '$and';
    let ignoreCase = true;
    let query = req.query;
    let userId = req.user.id;
    let userLimit = {'$or': [{createdBy: userId}, {modifiedBy: userId}]};
    let search = {};

    //handle empty query
    if(!Object.keys(query).length) {
      if(req.user.permissionLevel === 'USER') {
        search = userLimit;
      }
      else {
        search = {};
      }
    }
    else {
      //build search fields, with operator
      let fields = {};
      if(query.operator) {
        operator = '$' + query.operator;
        delete query.operator;
      }
      if(query.ignorecase) {
        ignoreCase = query.ignorecase;
        delete query.ignorecase;
      }
      fields[operator] = Object.keys(query).map(key => {
        var obj = {};
        obj['properties.' + key] = ignoreCase ? {'$regex': new RegExp(query[key], 'i') } : query[key];
        return obj;
      });

      if(req.user.permissionLevel === 'USER') {
        if(fields[operator].length === 1) {
          search = {'$and': [fields[operator][0], userLimit]};
        }
        else {
          search = {'$and': [fields, userLimit]};
        }
      }
      else {
        search = fields;
      }
    }
    return search;
  };

  /**
   * Get all items
   * @memberof ItemsModel
   * User can provide query parameters to search over properties<br>
   * Query string will be in the form of field1=value1&field2=value2...<br>
   * By default, terms are conjunctive (i.e. term1 AND term2 AND...), unless 'operator=or' is specified<br>
   * Search will be case insensitive, unless 'ignorecase=false' is specified
   *
   * @see {@link ItemsModel.parseQueryParameters}
   *
   * @param  {Object}   req  Request object, containing the query object
   * @param  {Object}   res  Response object
   * @param  {Function} next next operation
   */
  this.findAll = function(req, res, next) {
    var search = parseQueryParameters(req);
    debug('search criteria', require('util').inspect(parseQueryParameters(req), true, 4, true));
    ItemModel.find(search, (err, items) => {
      if(err) {
        helper.handleError(500, err, req, res);
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
   * @memberof ItemsModel
   * @param  {Object}   req  Request object, containing the id parameter
   * @param  {Object}   res  Response object
   * @param  {Function} next next operation
   */
  this.findById = function(req, res, next) {
    //verify id is legal
    var id = helper.getObjectId(req.params.id);
    if(id === null) {
      helper.handleError(400, 'illegal item id', req, res);
      return next();
    }
    ItemModel.findById(id, (err, item) => {
      if(err) {
        helper.handleError(500, err, req, res);
      }
      else {
        if(item) {
          res.json(200, {error: false, data: item.toObject()});
        }
        else {
          helper.handleError(404, util.format('Item: %s not found', req.params.id), req, res);
        }
      }
      return next();
    });
  };

  /**
   * Creates a new item
   * @memberof ItemsModel
   * @param  {Object}   req  Request object, containing body object with item properties
   * @param  {Object}   res  Response object
   * @param  {Function} next next operation
   */
  this.create = function(req, res, next) {
    //verify input is not empty
    if(helper.isEmpty(req.body)) {
      helper.handleError(400, 'malformed input', req, res);
      return next();
    }
    //verify id is legal
    let userId = req.user ? req.user.id : null;
    var newItem = new ItemModel({properties: req.body, createdBy: userId});
    debug('creator %s, item %s', userId, newItem);
    newItem.save((err, item) => {
      if(err) {
        helper.handleError(500, err, req, res);
      }
      else {
        res.json(201, {error: false, data: item.toObject()});
      }
      helper.log(req, ELEMENT, 'CREATE', item.id);
      return next();
    });
  };

  /**
   * Updates an existing item
   * @memberof ItemsModel
   * @param  {Object}   req  [description]
   * @param  {Object}   req  Request object, containing body object with item properties
   * @param  {Object}   res  Response object
   * @param  {Function} next next operation
   */
  this.update = function(req, res, next) {
    //verify input is not empty
    if(helper.isEmpty(req.body)) {
      helper.handleError(400, 'malformed input', req, res);
      return next();
    }
    //verify id is legal
    let userId = req.user ? req.user.id : null;
    let id = helper.getObjectId(req.params.id);
    if(id === null) {
      helper.handleError(400, 'illegal item id', req, res);
      return next();
    }
    ItemModel.findById(id, (err, item) => {
      if(err) {
        helper.handleError(500, err, req, res);
        return next();
      }
      else {
        if(item) {
          item.modified = Date.now();
          debug('modifier', userId);
          if(req.params.replace) {
            item.properties = req.body;
            item.createdBy = userId;
          }
          else {
            for(let field of Object.keys(req.body)) {
              item.properties[field] = req.body[field];
            }
          }
          item.modifiedBy = userId;
          debug(item);
          item.markModified('properties');
          item.save((err2, newItem) => {
            if(err2) {
              helper.handleError(500, err2, req, res);
            }
            else {
              res.json(200, {error: false, data: newItem.toObject()});
              helper.log(req, ELEMENT, 'UPDATE', id);
            }
            return next();
          });
        }
        else {
          helper.handleError(404, util.format('Item: %s not found', req.params.id), req, res);
          return next();
        }
      }
    });
  };

  /**
   * Delete item
   * @memberof ItemsModel
   * @param  {Object}   req  Request object, containing item id
   * @param  {Object}   res  Response object
   * @param  {Function} next next operation
   */
  this.delete = function(req, res, next) {
    //verify id is legal
    var id = helper.getObjectId(req.params.id);
    if(id === null) {
      helper.handleError(400, 'illegal item id', req, res);
      return next();
    }
    ItemModel.findByIdAndRemove(id, (err, item) => {
      if(err) {
        helper.handleError(500, err, req, res);
      }
      else {
        if(item) {
          debug(item);
          res.json(200, {error: false, data: util.format('Item %s deleted successfully', item.id)});
          helper.log(req, ELEMENT, 'DELETE', item.id);
        }
        else {
          helper.handleError(404, util.format('Item: %s not found', req.params.id), req, res);
        }
      }
      return next();
    });
  };
};

module.exports = new ItemsModel();
