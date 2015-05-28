'use strict';

module.exports = function(server) {
  var users = require('../models/users');
  server.get('/users', users.findAll);
  server.get('/users/:email', users.findByEmail);
  server.post('/users', users.create);
  server.put('/users/:email', users.update);
  server.del('/users/:email', users.delete);
  server.post('/users/login', users.login);
};
