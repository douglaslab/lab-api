'use strict';

var debug = require('debug')('test:function:admin');
var request = require('supertest');
var should = require('should');
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

describe('Admin functional tests', () => {
  let newPermission = {
    element: 'ITEM',
    action: 'UPDATE',
    permissionRequired: 'MANAGER'
  };

  it('should Create a new permission', (done) => {
    request(process.env.TEST_URL)
      .post('/admin/permission')
      .set('X-API-Authorization', helpers.generateAuthorizationHeader(testUser))
      .send(newPermission)
      .expect('Content-Type', /json/)
      .expect(201)
      .end((err, res) => {
        debug(res.body);
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.false;
        res.body.should.have.property('data');
        res.body.data.should.have.property('element');
        res.body.data.element.should.equal(newPermission.element);
        return done();
      });
  });

  it('should fail to Create an illegal permission', (done) => {
    var permission = {
      element: 'item',
      action: 'delete',
      permissionRequired: 'MANAGER'
    };
    request(process.env.TEST_URL)
      .post('/admin/permission')
      .set('X-API-Authorization', helpers.generateAuthorizationHeader(testUser))
      .send(permission)
      .expect('Content-Type', /json/)
      .expect(500)
      .end((err, res) => {
        debug(res.body);
        should.not.exist(err);
        res.body.should.have.property('error');
        res.body.error.should.be.true;
        res.body.should.have.property('data');
        res.body.data.should.equal('Permission validation failed');
        return done();
      });
  });

  it('should Retrieve all permissions', (done) => {
    request(process.env.TEST_URL)
      .get('/admin/permission')
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
        res.body.data.filter(permission => JSON.stringify(permission) === JSON.stringify(newPermission)).should.have.lengthOf(1);
        return done();
      });
  });

  it('should Retrieve one permission', (done) => {
    request(process.env.TEST_URL)
      .get('/admin/permission?element=ITEM')
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
        res.body.data.filter(permission => JSON.stringify(permission) === JSON.stringify(newPermission)).should.have.lengthOf(1);
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
