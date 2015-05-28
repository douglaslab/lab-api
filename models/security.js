'use strict';

var Security = function() {
  var crypto = require('crypto');
  var bcrypt = require('bcrypt');
  var util = require('util'); //TODO: util.format can be removed when Node starts supporting string templates


  this.getRandomBytes = function(length) {
    return crypto.randomBytes(length).toString('hex');
  };

  this.hashPassword = function(password) {
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  };

  this.getAuthorizationHeader = function(email, password) {
    var hash = new Buffer(util.format('%s:%s', email, password)).toString('base64');
    return util.format('Basic %s', hash);
  };

  this.validatePassword = function(givenPassword, savedPassword) {
    return bcrypt.compareSync(givenPassword, savedPassword);
  };

  this.generateToken = function(key, secret, timestamp) {
    var ts = timestamp || parseInt((new Date()).getTime() / 1000, 10);
    var hmac = crypto.createHmac('sha1', secret).update(key).digest('hex');
    var token = crypto.createHash('md5').update(hmac + ts).digest('hex');
    return token;
  };

  this.validateToken = function(token, key, secret, timestamp) {
    var newToken = this.generateToken(key, secret, timestamp);
    return token === newToken;
  };
};

module.exports = new Security();
