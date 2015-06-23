'use strict';

module.exports = function(server) {
  var users = require('../models/users');
  const ELEMENT = 'USER';
  server.get('/users', users.validateUser(ELEMENT, 'READ'), users.findAll);
  server.get('/users/:email', users.validateUser(ELEMENT, 'READ'), users.findByEmail);
  server.post('/users', users.validateUser(ELEMENT, 'CREATE'), users.create);
  server.put('/users/:email', users.validateUser(ELEMENT, 'UPDATE'), users.update);
  server.del('/users/:email', users.validateUser(ELEMENT, 'DELETE'), users.delete);
  server.post('/users/login', users.login);
};
