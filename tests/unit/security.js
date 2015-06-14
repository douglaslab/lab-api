'use strict';

var debug = require('debug')('test:unit:security');
var should = require('should');
var util = require('util');
var security = require('../../models/security');

before((done) => {
  should; //bypass ESLint no-unused-var error
  done();
});

describe('Security unit tests', () => {
  let pass = 'blahblah', hash;
  it('should generate 64 random bytes', () => {
    let result = security.generateRandomBytes(64);
    debug(result);
    result.should.not.be.empty;
  });

  it('should hash a paswword', () => {
    hash = security.hashPassword(pass);
    debug(hash);
    hash.should.not.be.empty;
  });

  it('should validate the hashed password', () => {
    security.validatePassword(pass, hash).should.be.true;
  });

  it('should generate basic authorization header', () => {
    let email = 'joe@schmoe.com';
    let header = security.generateAuthorizationHeader(email, pass);
    header.startsWith('Basic').should.be.true;
    header.substr('Basic'.length + 1).should.equal(new Buffer(util.format('%s:%s', email, pass)).toString('base64'));
  });

  let apiKey = security.generateRandomBytes(64);
  let apiSecret = security.generateRandomBytes(64);
  let timestamp = parseInt(Date.now() / 1000, 10);
  let token;
  it('should generate a token', () => {
    token = security.generateToken(apiKey, apiSecret, timestamp);
    token.should.not.be.empty;
  });

  it('should validate token', () => {
    security.validateToken(token, apiKey, apiSecret, timestamp).should.be.true;
  });

  it('should correctly parse authorization header', () => {
    let header = util.format('key=%s, token=%s, ts=%s', apiKey, token, timestamp);
    let result = security.parseApiAuthorizationHeader(header);
    result.should.have.property('key');
    result.key.should.equal(apiKey);
    result.should.have.property('token');
    result.token.should.equal(token);
    result.should.have.property('ts');
    result.ts.should.equal(timestamp.toString());
  });
});
