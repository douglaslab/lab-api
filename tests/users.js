'use strict';

var debug = require('debug')('test:users');
var request = require('supertest');
var should = require('should');

before((done) => require('./startServer.js')(done));

describe('Users tests', () => {
  var newUser = {
    name: 'Joe Shmoe',
    email: 'joe@shmoe.com',
    school: 'UCSF'
  };

  it('should Create a new item', (done) => {
    request(process.env.TEST_URL)
      .post('/users')
      .send(newUser)
      .expect('Content-Type', /json/)
      .expect(201)
      .end((err, res) => {
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        res.body.should.have.property('data');
        res.body.data.should.have.property('email').and.should.equal(newUser.email);
        debug(res.body);
        return done();
      });
  });

  it('should Retrieve the created item', (done) => {
    request(process.env.TEST_URL)
      .get('/users/' + newUser.email)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        res.body.should.have.property('data');
        res.body.data.should.have.property('email').and.sould.equal(newUser.email);
        debug(res.body);
        return done();
      });
  });

  it('should Retrieve all items', (done) => {
    request(process.env.TEST_URL)
      .get('/users')
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
    newUser.name = 'updated';
    request(process.env.TEST_URL)
      .put('/users/' + id)
      .send(newUser)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        res.body.should.have.property('data');
        res.body.data.should.have.property('id');
        res.body.data.should.have.property('properties');
        res.body.data.properties.name.should.equal(newUser.name);
        id = res.body.data.id;
        debug(res);
        return done();
      });
  });

  it('should Delete the created item', (done) => {
    request(process.env.TEST_URL)
      .del('/users/' + id)
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
