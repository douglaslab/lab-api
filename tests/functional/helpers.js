'use strict';

var debug = require('debug')('test:helpers');
var server = require('../../server');
var users = require('../../models/users');

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

exports.createTestUser = function(permissionLevel, callback) {
  var rand = Math.floor(Math.random() * 1000000);
  var newUser = {
    name: 'test' + rand,
    email: 'test' + rand + '@example.com',
    password: 'blahblah',
    permissionLevel: permissionLevel,
    school: 'UCSF'
  };
  var req = {
    body: newUser
  };
  var res = {
    json: function (status, result) {
      debug('test user %s created', result.data.email);
      var err = (status !== 201) ? new Error(err) : null;
      callback(err, result.data);
    }
  };
  users.create(req, res, () => {});
};

exports.deleteTestUser = function(email, callback) {
  var req = {
    params: {
      email: email
    }
  };
  var res = {
    json: function (status, result) {
      debug(result.data);
      var err = (status !== 200) ? new Error(err) : null;
      callback(err, result.data);
    }
  };
  users.delete(req, res, () => {});
};
