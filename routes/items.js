'use strict';

module.exports = function(server) {
  var items = require('../models/items');
  server.get('/items', items.findAll);
  server.get('/items/:id', items.findOne);
  server.post('/items', items.create);
  server.put('/items/:/id', items.update);
  server.del('/items/:/id', items.delete);
};
