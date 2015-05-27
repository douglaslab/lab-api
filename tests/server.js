'use strict';

var debug = require('debug')('test:server');
var request = require('supertest');
var should = require('should');

before((done) => require('./startServer.js')(done));

describe('Basic API tests', () => {
  it('should return 404 error', (done) => {
    request(process.env.TEST_URL)
      .get('/blahblah')
      .expect(404, done);
  });

  it('should return default message at root', (done) => {
    request(process.env.TEST_URL)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        res.body.should.have.property('message');
        debug(res.body);
        return done();
      });
  });
});
