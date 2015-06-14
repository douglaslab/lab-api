'use strict';

var debug = require('debug')('helper');
var ObjectId = require('mongoose').Types.ObjectId;

var Helper = function() {
  /**
   * Check if an object is empty
   * @param  {Object}  obj object to test
   * @return {Boolean}
   */
  this.isEmpty = function(obj) {
    return (typeof obj === 'object' && Object.getOwnPropertyNames(obj).length === 0);
  };

  /**
   * Convert id string to a Mongoose ID
   * @param  {String} id id as received from user
   * @return {Object}    Mongoose ID, or null if ilegal
   */
  this.getObjectId = function(id) {
    try {
      return new ObjectId(id);
    }
    catch(ex) {
      return null;
    }
  };

  /**
   * Return error in JSON format
   * @param  {Integer} errorCode HTTP error code
   * @param  {Object} err       Error object - can be a string
   * @param  {Object} res       Response object
   */
  this.handleError = function(errorCode, err, res) {
    if(errorCode === 500) {
      console.error(err);
    }
    debug(err);
    res.json(errorCode, {error: true, data: (typeof err === 'string') ? err : err.message});
  };

  /**
   * Turns query string parameters into a list of Mongoose search terms<br>
   * By default, terms are conjunctive (i.e. term1 AND term2 AND...), unless 'operator=or' is specified<br>
   * Search will be case insensitive, unless 'ignorecase=false' is specified
   *
   * @param  {Object} query query string object, containing key and values
   * @return {Object}       Mongoose search object
   */
  this.parseQueryParameters = function(query) {
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
};

module.exports = new Helper();
