'use strict';

var debug = require('debug')('test:items');
var request = require('supertest');
var should = require('should');

var generateAuthorizationHeader = function() {
  var util = require('util');
  var security = require('../models/security');
  var timestamp = parseInt(Date.now() / 1000, 10);
  var apiKey = '3xKnb4yWgjr3xztbKgkc6wmMN0zRnPufAy2u6lqBfA4=';
  var apiSecret = 'F3UWMwSWhYEystverzDw1YetIMZ+RVv93yjrLboJcs0=';
  var token = security.generateToken(apiKey, apiSecret, timestamp);
  return util.format('key=%s, token=%s, ts=%s', apiKey, token, timestamp);
};

before((done) => require('./startServer.js')(done));

describe('Items tests', () => {
  var id = null;
  var newItem = {
    name: 'balance',
    units: 'metric',
    image: 'balance.png'
  };

  it('should Create a new item', (done) => {
    request(process.env.TEST_URL)
      .post('/items')
      .set('X-API-Authorization', generateAuthorizationHeader())
      .send(newItem)
      .expect('Content-Type', /json/)
      .expect(201)
      .end((err, res) => {
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        res.body.should.have.property('data');
        res.body.data.should.have.property('id');
        res.body.data.should.have.property('properties');
        res.body.data.properties.name.should.equal(newItem.name);
        id = res.body.data.id;
        debug(res.body);
        return done();
      });
  });

  it('should Retrieve the created item', (done) => {
    request(process.env.TEST_URL)
      .get('/items/' + id)
      .set('X-API-Authorization', generateAuthorizationHeader())
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        res.body.should.have.property('data');
        res.body.data.should.have.property('id');
        res.body.data.should.have.property('properties');
        res.body.data.properties.name.should.equal(newItem.name);
        res.body.data.id.should.equal(id);
        debug(res.body);
        return done();
      });
  });

  it('should Retrieve all items', (done) => {
    request(process.env.TEST_URL)
      .get('/items')
      .set('X-API-Authorization', generateAuthorizationHeader())
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        res.body.should.have.property('data');
        res.body.data.should.be.an.instanceOf(Array);
        res.body.data.filter(item => item.id === id).should.have.lengthOf(1);
        debug(res.body);
        return done();
      });
  });

  it('should Update the created item', (done) => {
    newItem.name = 'updated';
    request(process.env.TEST_URL)
      .put('/items/' + id)
      .set('X-API-Authorization', generateAuthorizationHeader())
      .send(newItem)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        res.body.should.have.property('data');
        res.body.data.should.have.property('id');
        res.body.data.should.have.property('properties');
        res.body.data.properties.name.should.equal(newItem.name);
        debug(res.body);
        return done();
      });
  });

  it('should Delete the created item', (done) => {
    request(process.env.TEST_URL)
      .del('/items/' + id)
      .set('X-API-Authorization', generateAuthorizationHeader())
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        debug(res.body);
        return done();
      });
  });
});
