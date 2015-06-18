'use strict';

var debug = require('debug')('test:helpers');
var httpMocks = require('node-mocks-http');
var server = require('../server');
var users = require('../models/users');
var security = require('../models/security');

var generateRandomUser = function(permissionLevel) {
  var rand = Math.floor(Math.random() * 1000000);
  return {
    name: 'test' + rand,
    email: 'test' + rand + '@example.com',
    password: 'blahblah',
    permissionLevel: permissionLevel,
    school: 'UCSF'
  };
};


exports.generateAuthorizationHeader = function(user) {
  var util = require('util');
  var timestamp = parseInt(Date.now() / 1000, 10);
  var token = security.generateToken(user.apiKey, user.apiSecret, timestamp);
  return util.format('key=%s, token=%s, ts=%s', user.apiKey, token, timestamp);
};

//helper function to start the service for tests
//The environment variable makes it reentrant
exports.startServer = function(done) {
  if(!process.env.TEST_URL) {
    //give the server 1/2 a second to start
    setTimeout(() => {
      process.env.TEST_URL = server.url.replace('[::]', 'localhost');
      debug('server started');
      done();
    }, 500);
  }
  else {
    done();
  }
};

//stop API server
exports.stopServer = function() {
  server.close();
};

exports.createTestUser = function(permissionLevel, callback) {
  var req = httpMocks.createRequest({body: generateRandomUser(permissionLevel)});
  var res = httpMocks.createResponse();
  users.create(req, res, () => {
    var result = JSON.parse(res._getData());
    var err = result.error ? new Error(result.data) : null;
    debug(result);
    debug('test user %s created', result.data.email);
    callback(err, result.data);
  });
};

exports.deleteTestUser = function(email, callback) {
  var req = httpMocks.createRequest({params: {email: email}});
  var res = httpMocks.createResponse();
  users.delete(req, res, () => {
    var result = JSON.parse(res._getData());
      debug(result);
      callback(null, result.data);
  });
};
