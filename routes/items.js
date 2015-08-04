'use strict';

module.exports = function(server) {
  var items = require('../models/items');
  var users = require('../models/users');
  const ELEMENT = 'ITEM';
  server.get('/items', users.validateUser(ELEMENT, 'READ'), items.findAll);
  server.get('/items/:id', users.validateUser(ELEMENT, 'READ'), items.findById);
  server.post('/items', users.validateUser(ELEMENT, 'CREATE'), items.create);
  server.put('/items/:id', users.validateUser(ELEMENT, 'UPDATE'), items.update);
  server.put('/items/:id/:replace', users.validateUser(ELEMENT, 'UPDATE'), items.update);
  server.del('/items/:id', users.validateUser(ELEMENT, 'DELETE'), items.delete);
};
