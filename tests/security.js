'use strict';

var debug = require('debug')('test:security');
var should = require('should');
var security = require('../models/security');

describe('Security tests', () => {
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
    header.substr('Basic'.length + 1).should.equal(new Buffer(email + ':' + pass).toString('base64'));
  });
});
