'use strict';

module.exports = function(server) {
  var items = require('../models/items');
  var users = require('../models/users');
  server.get('/items', users.validateUser('USER'), items.findAll);
  server.get('/items/:id', users.validateUser('USER'), items.findById);
  server.post('/items', users.validateUser('USER'), items.create);
  server.put('/items/:id', users.validateUser('USER'), items.update);
  server.del('/items/:id', users.validateUser('USER'), items.delete);
};
