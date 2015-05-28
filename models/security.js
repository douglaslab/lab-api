'use strict';

/**
 * @class
 * @classdesc Security/encryption functions
 */
var Security = function() {
  var crypto = require('crypto');
  var bcrypt = require('bcrypt');
  var util = require('util'); //TODO: util.format can be removed when Node starts supporting string templates

  /**
   * Generate a random string of base64 characters
   * @param  {Integer} length length of string to generate
   * @return {String}        base64 string
   */
  this.generateRandomBytes = function(length) {
    return crypto.randomBytes(length).toString('base64');
  };

  /**
   * Turn plaintext password into a bcrypt hash
   * @param  {String} password the plaintext password
   * @return {String}          hashed password
   */
  this.hashPassword = function(password) {
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  };

  /**
   * Validate a password against a stored, hashed password
   * @param  {String} givenPassword plaintext password
   * @param  {String} savedPassword saved hash
   * @return {Boolean}               result of comparison
   */
  this.validatePassword = function(givenPassword, savedPassword) {
    return bcrypt.compareSync(givenPassword, savedPassword);
  };

  /**
   * Generate a basic Authorization header for user login
   * header looks like 'Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=='
   * @param  {String} email    user's email
   * @param  {String} password user's password
   * @return {String}          header string
   */
  this.generateAuthorizationHeader = function(email, password) {
    var hash = new Buffer(util.format('%s:%s', email, password)).toString('base64');
    return util.format('Basic %s', hash);
  };

  /**
   * Parse API Authorization header into an object
   * header to be parsed looks like: 'X-API-Authorization: key=%key, token=%token, ts=%timestamp'
   * @param  {String} header text of X-API-Authorization header
   * @return {Object}        object containing {key, token, ts}
   */
  this.parseApiAuthorizationHeader = function(header) {
    var result = {};
    header.replace(new RegExp('([^?=,]+)(=([^,]*))?', 'g'), ($0, $1, $2, $3) => { result[$1.trim()] = $3.trim(); });
    return result;
  };

  /**
   * Generate API token
   * @param  {String} key       API key
   * @param  {String} secret    API secret
   * @param  {Integer} [timestamp] timestamp in seconds - optional. If not provided, current time is used
   * @return {String}           generated token
   */
  this.generateToken = function(key, secret, timestamp) {
    var ts = timestamp || parseInt((new Date()).getTime() / 1000, 10);
    var hmac = crypto.createHmac('sha1', secret).update(key).digest('hex');
    var token = crypto.createHash('md5').update(hmac + ts).digest('hex');
    return token;
  };

  /**
   * Validate a given token, by regenrating a token based on given data, and comparing
   * @param  {String} token     token to validate
   * @param  {String} key       API key
   * @param  {String} secret    API secret
   * @param  {Integer} timestamp timestamp in seconds
   * @return {Boolean}           result of comparison
   */
  this.validateToken = function(token, key, secret, timestamp) {
    var newToken = this.generateToken(key, secret, timestamp);
    return token === newToken;
  };
};

module.exports = new Security();
