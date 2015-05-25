'use strict';

var request = require('supertest');
var should = require('should');

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
        return done();
      });
  });
});
