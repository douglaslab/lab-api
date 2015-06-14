'use strict';

var debug = require('debug')('test:unit:items');
var should = require('should');
var httpMocks = require('node-mocks-http');
var items = require('../../models/items');
var helpers = require('../helpers');
var testUser = {};

before((done) => {
  helpers.createTestUser('USER', (err, user) => {
    testUser = err ? null : user;
    done(err);
  });
});

describe('Items unit tests', () => {
  var id = null;
  var newItem = {
    name: 'balance',
    units: 'metric',
    image: 'balance.png'
  };

  it('should Create a new item', (done) => {
    let req = httpMocks.createRequest({body: newItem});
    let res = httpMocks.createResponse();
    items.create(req, res, () => {
      let result = JSON.parse(res._getData());
      debug(result);
      res.statusCode.should.equal(201);
      result.should.have.property('error');
      result.error.should.be.false;
      result.should.have.property('data');
      result.data.should.have.property('id');
      result.data.should.have.property('properties');
      result.data.properties.name.should.equal(newItem.name);
      id = result.data.id;
      return done();
    });
  });

  it('should fail to create an empty item', (done) => {
    let req = httpMocks.createRequest();
    let res = httpMocks.createResponse();
    items.create(req, res, () => {
      let result = JSON.parse(res._getData());
      res.statusCode.should.equal(400);
      result.should.have.property('error');
      result.error.should.be.true;
      return done();
    });
  });

  it('should Retrieve the created item', (done) => {
    let req = httpMocks.createRequest({params: {id: id}});
    let res = httpMocks.createResponse();
    items.findById(req, res, () => {
      let result = JSON.parse(res._getData());
      debug(result);
      res.statusCode.should.equal(200);
      result.should.have.property('error');
      result.error.should.be.false;
      result.should.have.property('data');
      result.data.should.have.property('id');
      result.data.should.have.property('properties');
      result.data.id.should.equal(id);
      return done();
    });
  });

  it('should fail to Retrieve non-existing item', (done) => {
    let req = httpMocks.createRequest({params: {id: '123123123123'}});
    let res = httpMocks.createResponse();
    items.findById(req, res, () => {
      let result = JSON.parse(res._getData());
      debug(result);
      res.statusCode.should.equal(404);
      result.should.have.property('error');
      result.error.should.be.true;
      return done();
    });
  });

  it('should fail to Retrieve item with illegal id', (done) => {
    let req = httpMocks.createRequest({params: {id: 'blahblah'}});
    let res = httpMocks.createResponse();
    items.findById(req, res, () => {
      let result = JSON.parse(res._getData());
      debug(result);
      res.statusCode.should.equal(400);
      result.should.have.property('error');
      result.error.should.be.true;
      return done();
    });
  });

  it('should Retrieve all items', (done) => {
    let req = httpMocks.createRequest({params: {id: 'blahblah'}});
    let res = httpMocks.createResponse();
    items.findAll(req, res, () => {
      let result = JSON.parse(res._getData());
      debug(result);
      res.statusCode.should.equal(200);
      result.should.have.property('error');
      result.error.should.be.false;
      result.should.have.property('data');
      result.data.should.be.an.instanceOf(Array);
      result.data.filter(item => item.id === id).should.have.lengthOf(1);
      return done();
    });
  });

  it('should Update the properties of the created item', (done) => {
    newItem.name = 'updated';
    let req = httpMocks.createRequest({
      params: {id: id},
      body: newItem
    });
    let res = httpMocks.createResponse();
    items.update(req, res, () => {
      let result = JSON.parse(res._getData());
      debug(result);
      res.statusCode.should.equal(200);
      result.should.have.property('error');
      result.error.should.be.false;
      result.should.have.property('data');
      result.data.should.have.property('id');
      result.data.should.have.property('properties');
      result.data.properties.should.have.property('name');
      result.data.properties.name.should.equal(newItem.name);
      return done();
    });
  });

  it('should Replace all properties of the created item', (done) => {
    let item = {
      prop1: 'val1',
      prop2: 'val2'
    };
    let req = httpMocks.createRequest({
      params: {
        id: id,
        replace: true
      },
      body: item
    });
    let res = httpMocks.createResponse();
    items.update(req, res, () => {
      let result = JSON.parse(res._getData());
      debug(result);
      res.statusCode.should.equal(200);
      result.should.have.property('error');
      result.error.should.be.false;
      result.should.have.property('data');
      result.data.should.have.property('id');
      result.data.should.have.property('properties');
      result.data.properties.prop1.should.equal(item.prop1);
      result.data.properties.prop2.should.equal(item.prop2);
      Object.keys(result.data.properties).length.should.equal(Object.keys(item).length);
      return done();
    });
  });

  it('should fail to Update non-existing item', (done) => {
    newItem.name = 'updated';
    let req = httpMocks.createRequest({
      params: {id: '123123123123'},
      body: newItem
    });
    let res = httpMocks.createResponse();
    items.update(req, res, () => {
      let result = JSON.parse(res._getData());
      debug(result);
      res.statusCode.should.equal(404);
      result.should.have.property('error');
      result.error.should.be.true;
      return done();
    });
  });

  it('should fail to Update item with illegal id', (done) => {
    newItem.name = 'updated';
    let req = httpMocks.createRequest({
      params: {id: 'blahblah'},
      body: newItem
    });
    let res = httpMocks.createResponse();
    items.update(req, res, () => {
      let result = JSON.parse(res._getData());
      debug(result);
      res.statusCode.should.equal(400);
      result.should.have.property('error');
      result.error.should.be.true;
      return done();
    });
  });

  it('should Delete the created item', (done) => {
    let req = httpMocks.createRequest({params: {id: id}});
    let res = httpMocks.createResponse();
    items.delete(req, res, () => {
      let result = JSON.parse(res._getData());
      res.statusCode.should.equal(200);
      result.should.have.property('error');
      result.error.should.be.false;
      return done();
    });
  });

  it('should fail to Delete item with illegal id', (done) => {
    let req = httpMocks.createRequest({params: {id: 'blahblah'}});
    let res = httpMocks.createResponse();
    items.delete(req, res, () => {
      let result = JSON.parse(res._getData());
      res.statusCode.should.equal(400);
      result.should.have.property('error');
      result.error.should.be.true;
      return done();
    });
  });
});

after((done) => {
  helpers.deleteTestUser(testUser.email, done);
});
