'use strict';

var debug = require('debug')('test:helpers');
var request = require('supertest');

//helper function to start the service for tests
//The environment variable makes it reentrant
exports.startServer = function(done) {
  if(!process.env.TEST_URL) {
    var server = require('../server');
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

exports.createTestUser = function(callback) {
  var rand = Math.floor(Math.random() * 1000000);
  var newUser = {
    name: 'test' + rand,
    email: 'test' + rand + '@example.com',
    password: 'blahblah',
    school: 'UCSF'
  };
  request(process.env.TEST_URL)
    .post('/users')
    .send(newUser)
    .end((err, res) => {
      debug('test user %s created', res.body.data.email);
      callback(err, res.body.data);
    });
};

exports.deleteTestUser = function(email, callback) {
  request(process.env.TEST_URL)
    .del('/users/' + email)
    .end(() => {
      debug('test user %s deleted', email);
      callback();
    });
};
