'use strict';

var request = require('supertest');
var should = require('should');

describe('Items tests', () => {
  var id = null;
  var newItem = {
    name: 'balance',
    units: 'metric',
    image: 'balance.png'
  };

  it('should create a new item', (done) => {
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
        return done();
      });
  });

  it('should retrieve the created item', (done) => {
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
        return done();
      });
  });

  it('should update the created item', (done) => {
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
        return done();
      });
  });

  it('should delete the created item', (done) => {
    request(process.env.TEST_URL)
      .del('/items/' + id)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        return done();
      });
  });
});
