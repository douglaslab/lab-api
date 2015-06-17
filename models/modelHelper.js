'use strict';

var debug = require('debug')('helper');
var ObjectId = require('mongoose').Types.ObjectId;

/**
 * @class Helper
 * @classdesc various helper functions for other models
 */
var Helper = function() {
  /**
   * Check if an object is empty
   * @memberof Helper
   * @param  {Object}  obj object to test
   * @return {Boolean}
   */
  this.isEmpty = function(obj) {
    return (typeof obj === 'object' && Object.getOwnPropertyNames(obj).length === 0);
  };

  /**
   * Convert id string to a Mongoose ID
   * @memberof Helper
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
   * @memberof Helper
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
};

module.exports = new Helper();
