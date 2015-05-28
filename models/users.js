'use strict';

var debug = require('debug')('users');
var util = require('util'); //TODO: util.format can be removed when Node starts supporting string templates

var UsersModel = function() {
  var UserModel = require('./schemas/user');
  var security = require('./security');

  var handleError = function(errorCode, err, res) {
    debug(err);
    res.json(errorCode, {error: true, data: (typeof err === 'string') ? err : err.message});
  };

  var parseHeader = function(header) {
    //header to be parsed looks like: 'X-API-Authorization: key=%key, token=%token, ts=%timestamp'
    var result = {};
    header.replace(new RegExp('([^?=,]+)(=([^,]*))?', 'g'), ($0, $1, $2, $3) => { result[$1.trim()] = $3.trim(); });
    return result;
  };

  this.findAll = function(req, res, next) {
    UserModel.find({}, (err, users) => {
      if(err) {
        handleError(500, err, res);
      }
      else {
        var result = users.map(x => x.toObject());
        res.json(200, {error: false, data: result});
      }
      return next();
    });
  };

  this.findOne = function(req, res, next) {
    UserModel.findOne({email: req.params.email}, (err, user) => {
      if(err) {
        handleError(500, err, res);
      }
      else {
        if(user) {
          res.json(200, {error: false, data: user.toObject()});
        }
        else {
          handleError(404, util.format('user: %s not found', req.params.id), res);
        }
      }
      return next();
    });
  };

  this.validateUser = function(req, res, next) {
    var header = parseHeader(req.headers['X-API-Authrization']);
    UserModel.findOne({apiKey: header.key}, (err, user) => {
      if(err) {
        handleError(500, err, res);
      }
      else {
        if(user) {
          if(security.validateToken(header.token, user.apiKey, user.apiSecret, header.ts)) {
            return next();
          }
          else {
            handleError(401, 'incorrect token in X-API-Authrization', res);
          }
        }
        else {
          handleError(404, util.format('user with key: %s not found', header.key), res);
        }
      }
    });
  };

  this.login = function(req, res, next) {
    var email = req.authorization.basic.username;
    var password = req.authorization.basic.password;
    if(!email || !password) {
      handleError(401, 'incorrect email/password', res);
      return next();
    }
    UserModel.findOne({email: email}, '+password', (err, user) => {
      if(err) {
        handleError(500, err, res);
      }
      else {
        if(user) {
          if(security.validatePassword(password, user.password)) {
            res.json(204, {error: false, data: 'user logged in'});
          }
          else {
            handleError(401, 'incorrect password', res);
          }
        }
        else {
          handleError(404, ('user: %s not found', req.body.email), res);
        }
      }
      return next();
    });
  };

  this.create = function(req, res, next) {
    //verify input is an object
    var newUser = req.body;
    if(typeof newUser !== 'object') {
      handleError(400, 'malformed input', res);
      return next();
    }
    newUser.password = security.hashPassword(req.body.password);
    newUser.apiKey = security.getRandomBytes(32);
    newUser.apiSecret = security.getRandomBytes(32);
    newUser = new UserModel(newUser);
    newUser.save((err, user) => {
      if(err) {
        if(err.message.contains('duplicate')) {
          handleError(400, util.format('user with email %s already exists', newUser.email), res);
        }
        else {
          handleError(500, err, res);
        }
      }
      else {
        res.json(201, {error: false, data: user.toObject()});
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
          handleError(404, util.format('User: %s not found', req.params.email), res);
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
          res.json(200, {error: false, data: util.format('user %s deleted successfully', user.email)});
        }
        else {
          handleError(404, util.format('User: %s not found', req.params.email), res);
        }
      }
      return next();
    });
  };
};

module.exports = new UsersModel();
