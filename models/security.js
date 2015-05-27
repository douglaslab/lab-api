'use strict';

var Security = function() {
  var crypto = require('crypto');
  var bcrypt = require('bcrypt');

  this.getRandomBytes = function(length) {
    return crypto.randomBytes(length).toString('hex');
  };

  this.hashPassword = function(password) {
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
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
