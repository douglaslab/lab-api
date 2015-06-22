'use strict';

var debug = require('debug')('test:unit:users');
var should = require('should');
var httpMocks = require('node-mocks-http');
var users = require('../../models/users');
var helpers = require('../helpers');

describe('Users unit tests', () => {
  should;
  var newUser = {
    name: helpers.randomUserName(),
    email: helpers.randomUserName() + '@example.com',
    password: 'blahblah',
    school: 'UCSF'
  };

  it('should Create a new user', (done) => {
    let user = JSON.parse(JSON.stringify(newUser)); //clone newUser so it won't mutate
    let req = httpMocks.createRequest({body: user});
    let res = httpMocks.createResponse();
    users.create(req, res, () => {
      let result = JSON.parse(res._getData());
      debug(result);
      res.statusCode.should.equal(201);
      result.should.have.property('error');
      result.error.should.be.false;
      result.should.have.property('data');
      result.data.should.have.property('email');
      result.data.email.should.equal(newUser.email);
      return done();
    });
  });

  it('should login created user', (done) => {
    let req = httpMocks.createRequest();
    let res = httpMocks.createResponse();
    //mock authorization header
    req.authorization = {
      basic: {
        username: newUser.email,
        password: newUser.password
      }
    };
    users.login(req, res, () => {
      let result = JSON.parse(res._getData());
      debug(result);
      res.statusCode.should.equal(200);
      result.should.have.property('error');
      result.error.should.be.false;
      result.should.have.property('data');
      result.data.should.have.property('email');
      result.data.email.should.equal(newUser.email);
      return done();
    });
  });

  it('should Retrieve the created user', (done) => {
    let req = httpMocks.createRequest({params: {email: newUser.email}});
    let res = httpMocks.createResponse();
    users.findByEmail(req, res, () => {
      let result = JSON.parse(res._getData());
      debug(result);
      res.statusCode.should.equal(200);
      result.should.have.property('error');
      result.error.should.be.false;
      result.should.have.property('data');
      result.data.should.have.property('email');
      result.data.email.should.equal(newUser.email);
      return done();
    });
  });

  it('should Retrieve all users', (done) => {
    let req = httpMocks.createRequest();
    let res = httpMocks.createResponse();
    users.findAll(req, res, () => {
      let result = JSON.parse(res._getData());
      debug(result);
      res.statusCode.should.equal(200);
      result.should.have.property('error');
      result.error.should.be.false;
      result.should.have.property('data');
      result.data.should.be.an.instanceOf(Array);
      result.data.filter(item => item.email === newUser.email).should.have.lengthOf(1);
      return done();
    });
  });

  it('should Update the created user', (done) => {
    newUser.name = 'updated user';
    let user = JSON.parse(JSON.stringify(newUser)); //clone newUser so it won't mutate
    let req = httpMocks.createRequest({params: {email: newUser.email}, body: user});
    let res = httpMocks.createResponse();
    users.update(req, res, () => {
      let result = JSON.parse(res._getData());
      debug(result);
      res.statusCode.should.equal(200);
      result.should.have.property('error');
      result.error.should.be.false;
      result.should.have.property('data');
      result.data.should.have.property('name');
      result.data.name.should.equal(newUser.name);
      return done();
    });
  });

  it('should Delete the created delete', (done) => {
    let req = httpMocks.createRequest({params: {email: newUser.email}});
    let res = httpMocks.createResponse();
    users.delete(req, res, () => {
      let result = JSON.parse(res._getData());
      debug(result);
      res.statusCode.should.equal(200);
      result.should.have.property('error');
      result.error.should.be.false;
      return done();
    });
  });
});
