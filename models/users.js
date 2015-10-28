'use strict';

const ELEMENT = 'USER';
var fs = require('fs');
var async = require('async');
var util = require('util'); //TODO: util.format can be removed when Node starts supporting string templates
var debug = require('debug')('users');
var helper = require('./modelHelper');
var config = require('../configs/service');

/**
 * @class UsersModel
 * @classdesc model for users management
 */
var UsersModel = function() {
  var UserModel = require('./schemas/user');
  var PermissionModel = require('./schemas/permission');
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
    UserModel.find({}, (err, users) => {
      if(err) {
        helper.handleError(500, err, req, res);
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
        helper.handleError(500, err, req, res);
      }
      else {
        if(user) {
          res.json(200, {error: false, data: user.toObject()});
        }
        else {
          helper.handleError(404, util.format('user: %s not found', req.params.id), req, res);
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
  this.validateUser = function(element, action) {
    /**
     * Validate token of API user
     * @param  {Object}   req  Request object - the authorization header contains token, key, timestamp
     * @param  {Object}   res  Response object
     * @param  {Function} next Next operation
     */
    return function validateTokenAndPermission(req, res, next) {
      var apiAuthHeader = req.header(config.apiAuthHeader);
      if (!apiAuthHeader) {
        helper.handleError(401, util.format('incorrect token in %s', config.apiAuthHeader), req, res);
      }
      else {
        let header = security.parseApiAuthorizationHeader(apiAuthHeader);
        let requiredPermissionLevel = 'USER';
        async.series([
          function getPermission(callback) {
            PermissionModel.findOne({element: element, action: action}, (err, result) => {
              if(err) {
                req.log.log(err);
              }
              if(result) {
                requiredPermissionLevel = result.permissionRequired;
              }
              callback(null);
            });
          },
          function getUser() {
            UserModel.findOne({apiKey: header.key, active: true}, 'email name apiKey apiSecret permissionLevel', (err, user) => {
              if(err) {
                helper.handleError(500, err, req, res);
              }
              else {
                if(user) {
                  debug(user);
                  if(security.validateToken(header.token, user.apiKey, user.apiSecret, header.ts)) {
                    debug(user.permissionLevel, requiredPermissionLevel);
                    //a special paermisision case: a user operating on their own record is allowed (except deleting it)
                    if(checkPermissionLevel(user.permissionLevel, requiredPermissionLevel) ||
                      (element === 'USER' && user.email === req.params.email && action !== 'DELETE')) {
                      req.user = {
                        id: helper.getObjectId(user._id),
                        active: user.active,
                        name: user.name,
                        email: user.email,
                        permissionLevel: user.permissionLevel
                      };
                      debug(req.user);
                      return next();
                    }
                    else {
                      helper.handleError(403, 'permission denied', req, res);
                    }
                  }
                  else {
                    helper.handleError(401, util.format('incorrect token in %s', config.apiAuthHeader), req, res);
                  }
                }
                else {
                  helper.handleError(404, util.format('user with key: %s not found', header.key), req, res);
                }
                return next();
              }
            });
          }
        ]);
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
      helper.handleError(401, 'incorrect email/password', req, res);
      return next();
    }
    UserModel.findOne({email: email, active: true}, '+password', (err, user) => {
      if(err) {
        helper.handleError(500, err, req, res);
      }
      else {
        if(user) {
          if(security.validatePassword(password, user.password)) {
            res.json(200, {error: false, data: user.toObject()});
            req.user = user;
            helper.log(req, user, ELEMENT, 'login');
          }
          else {
            helper.handleError(401, 'incorrect password', req, res);
          }
        }
        else {
          debug('user: %s not found', email);
          helper.handleError(404, util.format('user: %s not found', email), req, res);
        }
      }
      return next();
    });
  };

  /**
   * Allow user login by Slack handle/PIN
   * @memberof UsersModel
   * @param  {Object}   req  Request object - handle and pin passed in the Authorization header
   * @param  {Object}   res  Response object
   * @param  {Function} next Next operation
   */
  this.loginWithSlack = function(req, res, next) {
    var handle = req.authorization.basic.username;
    var pin = req.authorization.basic.password;
    if(!handle || !pin) {
      helper.handleError(401, 'incorrect Slack handle/pin', req, res);
      return next();
    }
    UserModel.findOne({active: true, 'services.serviceName': {$regex: /Slack/i}, 'services.handle': handle}, (err, user) => {
      if(err) {
        helper.handleError(500, err, req, res);
      }
      else {
        if(user) {
          if(user.pin === pin) {
            res.json(200, {error: false, data: user.toObject()});
            req.user = user;
            helper.log(req, user, ELEMENT, 'login with Slack');
          }
          else {
            helper.handleError(401, 'incorrect pin', req, res);
          }
        }
        else {
          debug('user: %s not found', handle);
          helper.handleError(404, util.format('user: %s not found', handle), req, res);
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
    var levels = UserModel.schema.path('permissionLevel').enumValues;
    if(typeof newUser !== 'object' || !newUser.email || !newUser.password || !newUser.name) {
      helper.handleError(400, 'malformed input - user must have at least email, password, and name properties', req, res);
      return next();
    }
    newUser.permissionLevel = levels.indexOf(newUser.permissionLevel) !== -1 ? newUser.permissionLevel : 'USER';
    newUser.password = security.hashPassword(req.body.password);
    newUser.apiKey = security.generateRandomBytes(32);
    newUser.apiSecret = security.generateRandomBytes(32);
    newUser.active = true;
    newUser = new UserModel(newUser);
    newUser.save((err, user) => {
      if(err) {
        if(err.message.contains('duplicate')) {
          helper.handleError(400, util.format('user with email %s already exists', newUser.email), req, res);
        }
        else {
          helper.handleError(500, err, req, res);
        }
      }
      else {
        res.json(201, {error: false, data: user.toObject()});
        debug(req);
        helper.log(req, ELEMENT, 'CREATE', user.email);
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
      helper.handleError(400, 'malformed input', req, res);
      return next();
    }
    if(updated.password) {
      updated.password = security.hashPassword(updated.password);
    }
    updated.modified = Date.now();
    UserModel.findOneAndUpdate({email: req.params.email}, req.body, {new: true}, (err, updatedUser) => {
      if(err) {
        helper.handleError(500, err, req, res);
      }
      else {
        if(updatedUser) {
          res.json(200, {error: false, data: updatedUser.toObject()});
          helper.log(req, ELEMENT, 'UPDATE', updatedUser.email);
        }
        else {
          helper.handleError(404, util.format('User: %s not found', req.params.email), req, res);
        }
      }
      return next();
    });
  };

  /**
   * Activate/Deactivate a user
   * @memberof UsersModel
   * @param  {Object}   req  Request object - params contains email
   * @param  {Object}   res  Response object
   * @param  {Function} next Next operation
   */
  this.changeUserActivation = function(req, res, next) {
    UserModel.findOneAndUpdate({email: req.params.email}, {active: req.params.active}, {new: true}, (err, user) => {
      if(err) {
        helper.handleError(500, err, req, res);
      }
      else {
        if(user) {
          res.json(200, {error: false, data: util.format('user %s %s', user.email, user.active ? 'activated' : 'deactivated')});
          helper.log(req, ELEMENT, 'UPDATE', user.email);
        }
        else {
          helper.handleError(404, util.format('User: %s not found', req.params.email), req, res);
        }
      }
      return next();
    });
  };

  /**
   * Delete a user - physically
   * @memberof UsersModel
   * @param  {Object}   req  Request object - params contains email
   * @param  {Object}   res  Response object
   * @param  {Function} next Next operation
   */
  this.delete = function(req, res, next) {
    UserModel.findOneAndRemove({email: req.params.email}, (err, user) => {
      if(err) {
        helper.handleError(500, err, req, res);
      }
      else {
        if(user) {
          res.json(200, {error: false, data: util.format('user %s deleted successfully', user.email)});
          helper.log(req, ELEMENT, 'DELETE', user.email);
        }
        else {
          helper.handleError(404, util.format('User: %s not found', req.params.email), req, res);
        }
      }
      return next();
    });
  };

  /**
   * Get user cloud storage service/s
   * @param  {Object}   req  Request object - param contains user email and serviceName
   *                                           If serviceName is empty, all services will be returned
   * @param  {Object}   res  Response object
   * @param  {Function} next Next operation
   */
  this.getService = function(req, res, next) {
    UserModel.findOne({email: req.params.email}, (err, user) => {
      if(err) {
        helper.handleError(500, err, req, res);
      }
      else {
        if(user) {
          let services;
          let serviceName = req.params.serviceName;
          if(serviceName) {
            services = user.services.filter((s) => s.serviceName.toLowerCase() === serviceName.toLowerCase());
          }
          else {
            services = user.services;
          }
          if(serviceName && services.length === 0) {
            helper.handleError(404, util.format('service: %s not found', serviceName), req, res);
          }
          else {
            res.json(200, {error: false, data: services.map((s) => s.toObject())});
          }
        }
        else {
          helper.handleError(404, util.format('user: %s not found', req.params.id), req, res);
        }
      }
      return next();
    });
  };

  /**
   * Create user cloud storage service
   * @param {Object}   req  Request object - param contains user email and body contains {serviceName, token, additional}
   *                                          If serviceName already exists, then token and additional will be updated
   * @param  {Object}   res  Response object
   * @param  {Function} next Next operation
   */
  this.createService = function(req, res, next) {
    if(!req.body.serviceName) {
      helper.handleError(400, 'serviceName missing', req, res);
      return next();
    }
    UserModel.findOne({email: req.params.email}, (err, user) => {
      if(err) {
        helper.handleError(500, err, req, res);
        return next();
      }
      else {
        if(user) {
          let exists = false;
          user.services.forEach((s) => {
            if(s.serviceName.toLowerCase() === req.body.serviceName.toLowerCase()) {
              s.token = req.body.token;
              s.additional = req.additional;
              exists = true;
            }
          });
          if(!exists) {
            user.services.push(req.body);
          }
          user.save((err2) => {
            if(err2) {
              helper.handleError(500, err2, req, res);
            }
            else {
              res.json(201, {error: false, data: util.format('service %s added', req.body.serviceName)});
              helper.log(req, ELEMENT, 'UPDATE', util.format('service %s added for user %s', req.body.serviceName, user.email));
            }
            return next();
          });
        }
        else {
          helper.handleError(404, util.format('user: %s not found', req.params.id), req, res);
          return next();
        }
      }
    });
  };

  /**
   * Delete user cloud storage service ctoken
   * @param  {Object}   req  Request object - params contains user email and serviceName
   * @param  {Object}   res  Response object
   * @param  {Function} next Next operation
   */
  this.deleteService = function(req, res, next) {
    if(!req.params.serviceName) {
      helper.handleError(400, 'serviceName missing', req, res);
      return next();
    }
    UserModel.findOne({email: req.params.email}, (err, user) => {
      if(err) {
        helper.handleError(500, err, req, res);
        return next();
      }
      else {
        if(user) {
          user.services = user.services.filter((s) => s.serviceName.toLowerCase() !== req.params.serviceName.toLowerCase());
          user.save((err2) => {
            if(err2) {
              helper.handleError(500, err2, req, res);
            }
            else {
              res.json(200, {error: false, data: util.format('service %s deleted successfully', req.params.serviceName)});
              helper.log(req, ELEMENT, 'UPDATE', util.format('service %s deleted for user %s', req.params.serviceName, user.email));
            }
            return next();
          });
        }
        else {
          helper.handleError(404, util.format('user: %s not found', req.params.id), req, res);
          return next();
        }
      }
    });
  };

  this.getPhoto = function(req, res, next) {
    UserModel.findOne({email: req.params.email}, (err, user) => {
      if(err) {
        helper.handleError(500, err, req, res);
        return next();
      }
      else {
        if(user) {
          if(user.photo.length) {
            res.contentType = 'application/octet-stream';
            res.send(user.photo);
            return next();
          }
          else {
            helper.handleError(404, util.format('user: %s has no photo', req.params.email), req, res);
            return next();
          }
        }
        else {
          helper.handleError(404, util.format('user: %s not found', req.params.email), req, res);
          return next();
        }
      }
    });
  };

  this.savePhoto = function(req, res, next) {
    UserModel.findOne({email: req.params.email}, (err, user) => {
      if(err) {
        helper.handleError(500, err, req, res);
        return next();
      }
      else {
        if(user) {
          user.photo = fs.readFileSync(req.files.photo.path);
          user.save((err2) => {
            if(err2) {
              helper.handleError(500, err2, req, res);
            }
            else {
              res.json(200, {error: false, data: 'photo uploaded successfully'});
              helper.log(req, ELEMENT, 'UPDATE', util.format('photo uploaded for user %s', user.email));
            }
            return next();
          });
        }
        else {
          helper.handleError(404, util.format('user: %s not found', req.params.id), req, res);
          return next();
        }
      }
    });
  };
};

module.exports = new UsersModel();
