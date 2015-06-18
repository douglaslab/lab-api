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
  this.get = function(criteria, callback) {
    var search = {};
    for(var field of criteria) {
      if(field === 'from' || field === 'to') {
        search.created = {
          '$gte': new Date(criteria.from),
          '$lt': criteria.to ? new Date(criteria.to) : new Date()
        };
        delete criteria.from;
        delete criteria.to;
      }
      else {
        search[field] = criteria[field];
      }
    }
    debug(search);
    AuditModel.find(search, callback);
  };

  this.create = function(entry, callback) {
    var newEntry = new AuditModel(entry);
    newEntry.save(callback);
  };
};

module.exports = new Audits();
