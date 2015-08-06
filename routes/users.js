'use strict';

module.exports = function(server) {
  var users = require('../models/users');
  const ELEMENT = 'USER';
  server.post('/users/login', users.login);
  server.post('/users/loginwithslack', users.loginWithSlack);
  server.get('/users', users.validateUser(ELEMENT, 'READ'), users.findAll);
  server.get('/users/:email', users.validateUser(ELEMENT, 'READ'), users.findByEmail);
  server.post('/users', users.validateUser(ELEMENT, 'CREATE'), users.create);
  server.put('/users/:email', users.validateUser(ELEMENT, 'UPDATE'), users.update);
  server.del('/users/:email', users.validateUser(ELEMENT, 'DELETE'), users.delete);
  // user photo
  server.get('/users/photo/:email', users.getPhoto);
  server.post('/users/photo/:email', users.savePhoto);
  //cloud service routes - adding/removing service is considerd an Update operation
  server.get('/users/:email/service', users.validateUser(ELEMENT, 'READ'), users.getService);
  server.get('/users/:email/service/:serviceName', users.validateUser(ELEMENT, 'READ'), users.getService);
  server.post('/users/:email/service', users.validateUser(ELEMENT, 'UPDATE'), users.createService);
  server.del('/users/:email/service/:serviceName', users.validateUser(ELEMENT, 'UPDATE'), users.deleteService);
};
