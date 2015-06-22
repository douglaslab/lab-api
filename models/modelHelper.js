'use strict';

var debug = require('debug')('helper');

/**
 * @class ModelHelper
 * @classdesc various helper functions for other models
 */
var ModelHelper = function() {
  var ObjectId = require('mongoose').Types.ObjectId;
  var admin = require('./admin');

  /**
   * Check if an object is empty
   * @memberof ModelHelper
   * @param  {Object}  obj object to test
   * @return {Boolean}
   */
  this.isEmpty = function(obj) {
    return (typeof obj === 'object' && Object.getOwnPropertyNames(obj).length === 0);
  };

  /**
   * Convert id string to a Mongoose ID
   * @memberof ModelHelper
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
   * @memberof ModelHelper
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
   * Add an entry to the audits log
   * @memberOf ModelHelper
   * @param  {Object} user    User object
   * @param  {String} entity  Entity name
   * @param  {String} action  Action carried out
   * @param  {String} comment Comment
   */
  this.log = function(user, entity, action, comment) {
    //ignore users created during tests, of form TEST123456789
    if(!user || user.search(/TEST\d{9}/) !== -1) {
      debug('unit test in progress - skipping log', entity, action, comment);
    }
    else {
      var entry = {
        user: user,
        entity: entity,
        action: action,
        comment: comment || ''
      };
      debug('logging ', entry);
      admin.log(entry, (err) => err && console.error('could not log %s because %s', JSON.stringify(entry), err.message));
    }
  };
};

module.exports = new ModelHelper();
