'use strict';

var debug = require('debug')('admin');
var helper = require('./modelHelper');

/**
 * @class AdminModel
 * @classdesc model for users management
 */
var AdminModel = function() {
  var AuditModel = require('./schemas/audit');
  //var PermissionModel = require('./schemas/permission');

  /**
   * Get audits log
   * @memberof AdminModel
   * @param  {Object}   req  Request object - query contains search criteria
   * @param  {Object}   res  Response object
   * @param  {Function} next Next operation
   */
  this.getAuditLog = function(req, res, next) {
    var criteria = req.query;
    var search = {};
    Object.keys(criteria).forEach((field) => {
      if(field === 'from') {
        if(!search.created) {
          search.created = {};
        }
        search.created.$gte = criteria.from ? new Date(parseInt(criteria.from, 10)) : new Date(0);
      }
      else if(field === 'to') {
        if(!search.created) {
          search.created = {};
        }
        search.created.$lt = criteria.to ? new Date(parseInt(criteria.to, 10)) : Date.now();
      }
      else {
        search[field] = criteria[field];
      }
    });
    debug(criteria, search);
    AuditModel.find(search, (err, result) => {
      if(err) {
        helper.handleError(500, err, res);
      }
      else {
        res.json(200, {error: false, data: result.map(item => item.toObject())});
      }
      return next();
    });
  };

  this.log = function(entry, callback) {
    var newEntry = new AuditModel(entry);
    newEntry.save(callback);
  };
};

module.exports = new AdminModel();
