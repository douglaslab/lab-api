'use strict';

var debug = require('debug')('test:function:users');
var path = require('path');
var request = require('supertest');
var should = require('should');
var security = require('../../models/security');
var helpers = require('../helpers');
var testUser = {};

before((done) => {
  helpers.startServer(() => {
    helpers.createTestUser('ADMIN', (error, user) => {
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

describe('Users functional tests', () => {
  var newUser = helpers.generateRandomUser();

  it('should Create a new user', (done) => {
    request(process.env.TEST_URL)
      .post('/users')
      .set('X-API-Authorization', helpers.generateAuthorizationHeader(testUser))
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
      .set('Authorization', security.generateAuthorizationHeader(newUser.email, newUser.password))
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

  it('should Retrieve the created user', (done) => {
    request(process.env.TEST_URL)
      .get('/users/' + newUser.email)
      .set('X-API-Authorization', helpers.generateAuthorizationHeader(testUser))
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
      .set('X-API-Authorization', helpers.generateAuthorizationHeader(testUser))
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

  it('should Update the created user', (done) => {
    newUser.name = 'updated user';
    request(process.env.TEST_URL)
      .put('/users/' + newUser.email)
      .set('X-API-Authorization', helpers.generateAuthorizationHeader(testUser))
      .send({name: newUser.name})
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        debug(res.body);
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        res.body.should.have.property('data');
        res.body.data.should.have.property('name');
        res.body.data.name.should.equal(newUser.name);
        return done();
      });
  });

  it('should Upload user photo', (done) => {
    let filePath = path.join(__dirname, '..', '..', 'scripts', 'logo.png');
    request(process.env.TEST_URL)
      .put('/users/' + newUser.email + '/photo')
      .set('X-API-Authorization', helpers.generateAuthorizationHeader(testUser))
      .attach('photo', filePath)
      .expect(200)
      .end((err, res) => {
        debug(res.body);
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        return done();
      });
  });

  it('should Get user photo', (done) => {
    request(process.env.TEST_URL)
      .get('/users/' + newUser.email + '/photo')
      .set('X-API-Authorization', helpers.generateAuthorizationHeader(testUser))
      .set('Accept', 'application/octet-stream')
      .buffer(true)
      .parse(helpers.binaryParser)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        should.exists(res.body.length);
        return done();
      });
  });

  let newService = {
    serviceName: 'Slack',
    handle: 'jimmyTheKnife222',
    token: 'mytoken',
    additional: {info: 'additional info'}
  };

  it('should create a cloud service for user', (done) => {
    request(process.env.TEST_URL)
      .post('/users/' + newUser.email + '/service')
      .set('X-API-Authorization', helpers.generateAuthorizationHeader(testUser))
      .send(newService)
      .expect('Content-Type', /json/)
      .expect(201)
      .end((err, res) => {
        debug(res.body);
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        res.body.should.have.property('data');
        return done();
      });
  });

  it('should retrieve cloud service from user', (done) => {
    request(process.env.TEST_URL)
      .get('/users/' + newUser.email + '/service/' + newService.serviceName)
      .set('X-API-Authorization', helpers.generateAuthorizationHeader(testUser))
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        debug(res.body);
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        res.body.should.have.property('data');
        res.body.data.should.be.an.instanceOf(Array);
        res.body.data.length.should.equal(1);
        res.body.data[0].serviceName.should.equal(newService.serviceName);
        res.body.data[0].token.should.equal(newService.token);
        return done();
      });
  });

  it('should retrieve all cloud services from user', (done) => {
    request(process.env.TEST_URL)
      .get('/users/' + newUser.email + '/service')
      .set('X-API-Authorization', helpers.generateAuthorizationHeader(testUser))
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        debug(res.body);
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        res.body.should.have.property('data');
        res.body.data.should.be.an.instanceOf(Array);
        return done();
      });
  });

  it('should login with Slack handle and PIN', (done) => {
    request(process.env.TEST_URL)
      .post('/users/loginwithslack')
      .set('Authorization', security.generateAuthorizationHeader(newService.handle, newUser.pin))
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

  it('should delete the cloud service from user', (done) => {
    request(process.env.TEST_URL)
      .del('/users/' + newUser.email + '/service/' + newService.serviceName)
      .set('X-API-Authorization', helpers.generateAuthorizationHeader(testUser))
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

  it('should Deactivate the user', (done) => {
    request(process.env.TEST_URL)
      .put('/users/' + newUser.email + '/active/false')
      .set('X-API-Authorization', helpers.generateAuthorizationHeader(testUser))
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        debug(res.body);
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        res.body.should.have.property('data');
        res.body.data.indexOf('deactivate').should.not.equal(-1);
        return done();
      });
  });

  it('should Delete the created user', (done) => {
    request(process.env.TEST_URL)
      .del('/users/' + newUser.email)
      .set('X-API-Authorization', helpers.generateAuthorizationHeader(testUser))
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

after((done) => {
  helpers.deleteTestUser(testUser.email, () => {
    helpers.stopServer();
    done();
  });
});
