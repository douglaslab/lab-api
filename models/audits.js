'use strict';

var debug = require('debug')('audit');
var util = require('util'); //TODO: util.format can be removed when Node starts supporting string templates

/**
 * @class Audits
 * @classdesc model for audits log
 */
var Audits = function() {
  var AuditModel = require('./schemas/audit');

  /**
   * log an action in the audit trail
   * @param  {Object}   entry    Can have the fields {user, entity, action, comment}
   * @param  {Function} callback callback
   */
  this.get = function(search, callback) {
    AuditModel.find(search, (err, result) => {
      if(!err) {
        result = result.map(item => item.toObject());
      }
      callback(err, result);
    });
  };

  this.create = function(entry, callback) {
    var newEntry = new AuditModel(entry);
    newEntry.save(callback);
  };
};

module.exports = new Audits();
