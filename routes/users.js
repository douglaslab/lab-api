'use strict';

module.exports = function(server, mongoose) {
  var UsersModel = require('../models/users');
  var users = new UsersModel(mongoose);
  server.get('/users', users.findAll);
  server.get('/users/:email', users.findOne);
  server.post('/users', users.create);
  server.put('/users/:email', users.update);
  server.del('/users/:email', users.delete);
};
