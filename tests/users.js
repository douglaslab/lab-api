'use strict';

var debug = require('debug')('test:users');
var request = require('supertest');
var should = require('should');
var security = require('../models/security');

before((done) => require('./startServer.js')(done));

describe('Users tests', () => {
  var newUser = {
    name: 'Joe Shmoe',
    email: 'joe@shmoe.com',
    password: 'blahblah',
    school: 'UCSF'
  };

  it('should Create a new user', (done) => {
    request(process.env.TEST_URL)
      .post('/users')
      .send(newUser)
      .expect('Content-Type', /json/)
      .expect(201)
      .end((err, res) => {
        debug(res.body);
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        res.body.should.have.property('data');
        res.body.data.should.have.property('email');
        res.body.data.email.should.equal(newUser.email);
        return done();
      });
  });

  it('should login created user', (done) => {
    request(process.env.TEST_URL)
      .post('/users/login')
      .set('Authorization', security.getAuthorizationHeader(newUser.email, newUser.password))
      .expect(204)
      .end(done);
  });

  it('should Retrieve the created user', (done) => {
    request(process.env.TEST_URL)
      .get('/users/' + newUser.email)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        debug(res.body);
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        res.body.should.have.property('data');
        res.body.data.should.have.property('email');
        res.body.data.email.should.equal(newUser.email);
        return done();
      });
  });

  it('should Retrieve all users', (done) => {
    request(process.env.TEST_URL)
      .get('/users')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        debug(res.body);
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        res.body.should.have.property('data');
        res.body.data.should.be.an.instanceOf(Array);
        res.body.data.filter(item => item.email === newUser.email).should.have.lengthOf(1);
        return done();
      });
  });

//   it('should Update the created item', (done) => {
//     newUser.name = 'updated';
//     request(process.env.TEST_URL)
//       .put('/users/' + id)
//       .send(newUser)
//       .expect('Content-Type', /json/)
//       .expect(200)
//       .end((err, res) => {
//         debug(res.body);
//         should.not.exist(err);
//         res.body.should.have.property('error');
//         res.body.error.should.be.false;
//         res.body.should.have.property('data');
//         res.body.data.should.have.property('id');
//         res.body.data.should.have.property('properties');
//         res.body.data.properties.name.should.equal(newUser.name);
//         id = res.body.data.id;
//         return done();
//       });
//   });

  it('should Delete the created item', (done) => {
    request(process.env.TEST_URL)
      .del('/users/' + newUser.email)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        debug(res.body);
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        return done();
      });
  });
});
