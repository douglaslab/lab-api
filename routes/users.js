'use strict';

module.exports = function(server) {
  var users = require('../models/users');
  server.get('/users', users.validateUser('MANAGER'), users.findAll);
  server.get('/users/:email', users.validateUser('MANAGER'), users.findByEmail);
  server.post('/users', users.validateUser('MANAGER'), users.create);
  server.put('/users/:email', users.validateUser('MANAGER'), users.update);
  server.del('/users/:email', users.validateUser('ADMIN'), users.delete);
  server.post('/users/login', users.login);
};
