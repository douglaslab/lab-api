'use strict';

var debug = require('debug')('test:items');
var request = require('supertest');
var should = require('should');

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
        debug(res);
        return done();
      });
  });

  it('should Retrieve the created item', (done) => {
    request(process.env.TEST_URL)
      .get('/items/' + id)
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
        debug(res);
        return done();
      });
  });

  it('should Retrieve all items', (done) => {
    request(process.env.TEST_URL)
      .get('/items')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        res.body.should.have.property('data');
        res.body.data.should.be.an.instanceOf(Array);
        res.body.data.filter(item => item.id === id).should.have.lengthOf(1);
        debug(res);
        return done();
      });
  });

  it('should Update the created item', (done) => {
    newItem.name = 'updated';
    request(process.env.TEST_URL)
      .put('/items/' + id)
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
        id = res.body.data.id;
        debug(res);
        return done();
      });
  });

  it('should Delete the created item', (done) => {
    request(process.env.TEST_URL)
      .del('/items/' + id)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        debug(res);
        return done();
      });
  });
});
