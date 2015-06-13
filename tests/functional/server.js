'use strict';

var debug = require('debug')('test:server');
var request = require('supertest');
var should = require('should');
var helpers = require('./helpers');

before((done) => helpers.startServer(done));

describe('Server functional tests', () => {
  it('should return error for accessing root', (done) => {
    request(process.env.TEST_URL)
      .get('/')
      .expect(404, done);
  });

  it('should return error for undefined path', (done) => {
    request(process.env.TEST_URL)
      .get('/blahblah')
      .expect(404, done);
  });

  it('should return health', (done) => {
    request(process.env.TEST_URL)
      .get('/health')
      .expect(200)
      .end((err, res) => {
        debug(res.body);
        should.not.exist(err);
        res.body.should.have.property('data');
        res.body.data.should.have.property('version');
        return done();
      });
  });
});
