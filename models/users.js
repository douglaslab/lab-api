'use strict';

var debug = require('debug')('users:model');

var UsersModel = function() {
  var UserModel = require('./schemas/user');
  var security = require('./security');

  /**
   * Return JSON error message
   * @param  {Number} errorCode HTTP error code
   * @param  {Object} err The error string, or error object
   * @param  {Object} res Response object
   */
  var handleError = function(errorCode, err, res) {
    debug(err);
    res.json(errorCode, {error: true, data: (typeof err === 'string') ? err : err.message});
  };

  /**
   * [findAll description]
   * @param  {[type]}
   * @param  {[type]}
   * @param  {Function}
   * @return {[type]}
   */
  this.findAll = function(req, res, next) {
    UserModel.find({}, {sort: 'name'}, (err, users) => {
      if(err) {
        handleError(500, err, res);
      }
      else {
        res.json(200, {error: false, data: users});
      }
      return next();
    });
  };

  this.findOne = function(req, res, next) {
    UserModel.find({email: req.params.email}, (err, user) => {
      if(err) {
        handleError(500, err, res);
      }
      else {
        if(user) {
          res.json(200, {error: false, data: user});
        }
        else {
          handleError(404, 'user: ' + req.params.id + ' not found', res);
        }
      }
      return next();
    });
  };

  this.create = function(req, res, next) {
    //verify input is a
    if(typeof req.body !== 'object') {
      handleError(400, 'malformed input', res);
      return next();
    }
    var newUser = new UserModel(req.body);
    newUser.apiKey = security.getRandomBytes(64);
    newUser.apiSecret = security.getRandomBytes(64);
    newUser.save((err, user) => {
      if(err) {
        handleError(500, err, res);
      }
      else {
        res.json(201, {error: false, data: user});
      }
      return next();
    });
  };

  this.update = function(req, res, next) {
    if(typeof req.body !== 'object') {
      handleError(400, 'malformed input', res);
      return next();
    }
    req.body.modified = Date.now();
    UserModel.findOneAndUpdate({email: req.params.email}, req.body, (err, updatedUser) => {
      if(err) {
        handleError(500, err, res);
      }
      else {
        if(updatedUser) {
          res.json(200, {error: false, data: updatedUser});
        }
        else {
          handleError(404, 'User: ' + req.params.email + ' not found', res);
        }
      }
      return next();
    });
  };

  this.delete = function(req, res, next) {
    UserModel.findOneAndRemove({email: req.params.email}, (err, user) => {
      if(err) {
        handleError(500, err, res);
      }
      else {
        if(user) {
          res.json(200, {error: false, data: 'user ' + user.email + ' deleted successfully'});
        }
        else {
          handleError(404, 'User: ' + req.params.email + ' not found', res);
        }
      }
      return next();
    });
  };
};

module.exports = UsersModel;
