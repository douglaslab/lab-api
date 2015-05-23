'use strict';

var request = require('supertest');
var should = require('should');

describe('Basic API tests', () => {
  let url = '';
  //start the srever and get the url
  before((done) => {
    var server = require('../server');
    url = server.url.replace('[::]', 'localhost');
    //give the server 1/2 a second to start
    setTimeout(() => { done(); }, 500);
  });

  it('should return default message at root', (done) => {
    request(url)
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
