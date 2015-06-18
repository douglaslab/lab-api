'use strict';

var debug = require('debug')('test:function:items');
var request = require('supertest');
var should = require('should');
var helpers = require('../helpers');
var testUser = {};

before((done) => {
  helpers.startServer(() => {
    helpers.createTestUser('USER', (error, user) => {
      if(error) {
        done(error);
      }
      else {
        testUser = user;
        done();
      }
    });
  });
});

describe('Items functional tests', () => {
  var id = null;
  var newItem = {
    name: 'balance',
    units: 'metric',
    image: 'balance.png'
  };

  it('should Create a new item', (done) => {
    request(process.env.TEST_URL)
      .post('/items')
      .set('X-API-Authorization', helpers.generateAuthorizationHeader(testUser))
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
      .set('X-API-Authorization', helpers.generateAuthorizationHeader(testUser))
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
      .set('X-API-Authorization', helpers.generateAuthorizationHeader(testUser))
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
      .set('X-API-Authorization', helpers.generateAuthorizationHeader(testUser))
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

  it('should Replace all properties of the created item', (done) => {
    let item = {
      prop1: 'val1',
      prop2: 'val2'
    };
    request(process.env.TEST_URL)
      .put('/items/' + id + '/true')
      .set('X-API-Authorization', helpers.generateAuthorizationHeader(testUser))
      .send(item)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        res.body.should.have.property('data');
        res.body.data.should.have.property('id');
        res.body.data.should.have.property('properties');
        res.body.data.properties.prop1.should.equal(item.prop1);
        res.body.data.properties.prop2.should.equal(item.prop2);
        Object.keys(res.body.data.properties).length.should.equal(Object.keys(item).length);
        debug(res.body);
        return done();
      });
  });

  it('should Delete the created item', (done) => {
    request(process.env.TEST_URL)
      .del('/items/' + id)
      .set('X-API-Authorization', helpers.generateAuthorizationHeader(testUser))
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

after((done) => {
  helpers.deleteTestUser(testUser.email, () => {
    helpers.stopServer();
    done();
  });
});
