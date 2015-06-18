'use strict';

var debug = require('debug')('users');
var helper = require('./modelHelper');
var util = require('util'); //TODO: util.format can be removed when Node starts supporting string templates
var config = require('../configs/service');

/**
 * @class UsersModel
 * @classdesc model for users management
 */
var UsersModel = function() {
  var UserModel = require('./schemas/user');
  var security = require('./security');

  /**
   * Check if user permission level meets/exceeds required level
   * @memberof UsersModel
   * @param  {String} userLevel     User permission level - currently, one of USER, MANAGER, ADMIN
   * @param  {String} requiredLevel Required permission level - currently, one of USER, MANAGER, ADMIN
   * @return {Boolean}
   */
  var checkPermissionLevel = function(userLevel, requiredLevel) {
    var levels = UserModel.schema.path('permissionLevel').enumValues;
    return levels.indexOf(userLevel) >= levels.indexOf(requiredLevel);
  };

  /**
   * Get all users
   * @memberof UsersModel
   * @param  {Object}   req  Request object
   * @param  {Object}   res  Response object
   * @param  {Function} next Next operation
   */
  this.findAll = function(req, res, next) {
    UserModel.find({}, '+created +modified', (err, users) => {
      if(err) {
        helper.handleError(500, err, res);
      }
      else {
        var result = users.map(x => x.toObject());
        res.json(200, {error: false, data: result});
      }
      return next();
    });
  };

  /**
   * Find a user by email
   * @memberof UsersModel
   * @param  {Object}   req  Request object - params contains email
   * @param  {Object}   res  Response object
   * @param  {Function} next Next operation
   */
  this.findByEmail = function(req, res, next) {
    UserModel.findOne({email: req.params.email}, (err, user) => {
      if(err) {
        helper.handleError(500, err, res);
      }
      else {
        if(user) {
          res.json(200, {error: false, data: user.toObject()});
        }
        else {
          helper.handleError(404, util.format('user: %s not found', req.params.id), res);
        }
      }
      return next();
    });
  };

  /**
   * Return the validation middleware function, for the required permission level
   * @memberof UsersModel
   * @param  {String} requiredPermissionLevel currently, one of USER, MANAGER, ADMIN
   * @return {Function}                         See internal function for full comment
   * @see validateTokenAndPermission
   */
  this.validateUser = function(requiredPermissionLevel) {
    /**
     * Validate token of API user
     * @param  {Object}   req  Request object - the authorization header contains token, key, timestamp
     * @param  {Object}   res  Response object
     * @param  {Function} next Next operation
     */
    return function validateTokenAndPermission(req, res, next) {
      var apiAuthHeader = req.header(config.apiAuthHeader);
      if (!apiAuthHeader) {
        helper.handleError(401, util.format('incorrect token in %s', config.apiAuthHeader), res);
      }
      else {
        var header = security.parseApiAuthorizationHeader(apiAuthHeader);
        UserModel.findOne({apiKey: header.key}, 'apiKey apiSecret permissionLevel', (err, user) => {
          if(err) {
            helper.handleError(500, err, res);
          }
          else {
            if(user) {
              debug(user);
              if(security.validateToken(header.token, user.apiKey, user.apiSecret, header.ts)) {
                if(checkPermissionLevel(user.permissionLevel, requiredPermissionLevel)) {
                  return next();
                }
                else {
                  helper.handleError(403, 'operation disallowed', res);
                }
              }
              else {
                helper.handleError(401, util.format('incorrect token in %s', config.apiAuthHeader), res);
              }
            }
            else {
              helper.handleError(404, util.format('user with key: %s not found', header.key), res);
            }
            return next();
          }
        });
      }
    };
  };

  /**
   * Allow user login by email/password
   * @memberof UsersModel
   * @param  {Object}   req  Request object - email and password passed in the Authorization header
   * @param  {Object}   res  Response object
   * @param  {Function} next Next operation
   */
  this.login = function(req, res, next) {
    var email = req.authorization.basic.username;
    var password = req.authorization.basic.password;
    if(!email || !password) {
      helper.handleError(401, 'incorrect email/password', res);
      return next();
    }
    UserModel.findOne({email: email}, '+password', (err, user) => {
      if(err) {
        helper.handleError(500, err, res);
      }
      else {
        if(user) {
          if(security.validatePassword(password, user.password)) {
            res.json(200, {error: false, data: user.toObject()});
          }
          else {
            helper.handleError(401, 'incorrect password', res);
          }
        }
        else {
          helper.handleError(404, ('user: %s not found', req.body.email), res);
        }
      }
      return next();
    });
  };

  /**
   * Create a new user
   * @memberof UsersModel
   * @param  {Object}   req  Request object - body property contains user fields
   * @param  {Object}   res  Response object
   * @param  {Function} next Next operation
   */
  this.create = function(req, res, next) {
    //verify input is an object
    var newUser = req.body;
    if(typeof newUser !== 'object' || !newUser.email || !newUser.password || !newUser.name) {
      helper.handleError(400, 'malformed input - user must have at least email, password, and name properties', res);
      return next();
    }
    newUser.permissionLevel = UserModel.schema.path('permissionLevel').enumValues.indexOf(req.body.permissionLevel) !== -1 ?
      req.body.permissionLevel : 'USER';
    newUser.password = security.hashPassword(req.body.password);
    newUser.apiKey = security.generateRandomBytes(32);
    newUser.apiSecret = security.generateRandomBytes(32);
    newUser = new UserModel(newUser);
    newUser.save((err, user) => {
      if(err) {
        if(err.message.contains('duplicate')) {
          helper.handleError(400, util.format('user with email %s already exists', newUser.email), res);
        }
        else {
          helper.handleError(500, err, res);
        }
      }
      else {
        res.json(201, {error: false, data: user.toObject()});
      }
      return next();
    });
  };

  /**
   * Update a user
   * @memberof UsersModel
   * @param  {Object}   req  Request object - body property contains user fields
   * @param  {Object}   res  Response object
   * @param  {Function} next Next operation
   */
  this.update = function(req, res, next) {
    var updated = req.body;
    if(helper.isEmpty(updated)) {
      helper.handleError(400, 'malformed input', res);
      return next();
    }
    updated.password = security.hashPassword(updated.password);
    updated.modified = Date.now();
    UserModel.findOneAndUpdate({email: req.params.email}, req.body, {new: true}, (err, updatedUser) => {
      if(err) {
        helper.handleError(500, err, res);
      }
      else {
        if(updatedUser) {
          res.json(200, {error: false, data: updatedUser.toObject()});
        }
        else {
          helper.handleError(404, util.format('User: %s not found', req.params.email), res);
        }
      }
      return next();
    });
  };

  /**
   * Delete a user
   * @memberof UsersModel
   * @param  {Object}   req  Request object - params contains email
   * @param  {Object}   res  Response object
   * @param  {Function} next Next operation
   */
  this.delete = function(req, res, next) {
    UserModel.findOneAndRemove({email: req.params.email}, (err, user) => {
      if(err) {
        helper.handleError(500, err, res);
      }
      else {
        if(user) {
          res.json(200, {error: false, data: util.format('user %s deleted successfully', user.email)});
        }
        else {
          helper.handleError(404, util.format('User: %s not found', req.params.email), res);
        }
      }
      return next();
    });
  };
};

module.exports = new UsersModel();
