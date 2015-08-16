'use strict';

module.exports = function(server) {
  var users = require('../models/users');
  const ELEMENT = 'USER';
  // open access points
  server.post('/users/login', users.login);
  server.post('/users/loginwithslack', users.loginWithSlack);
  server.post('/users/new', users.create);
  // protected access points
  server.get('/users', users.validateUser(ELEMENT, 'READ'), users.findAll);
  server.get('/users/:email', users.validateUser(ELEMENT, 'READ'), users.findByEmail);
  server.post('/users', users.validateUser(ELEMENT, 'CREATE'), users.create);
  server.put('/users/:email', users.validateUser(ELEMENT, 'UPDATE'), users.update);
  server.put('/users/:email/active/:active', users.validateUser(ELEMENT, 'UPDATE'), users.changeUserActivation);
  server.del('/users/:email', users.validateUser(ELEMENT, 'DELETE'), users.delete);
  // user photo
  server.get('/users/:email/photo', users.validateUser(ELEMENT, 'READ'), users.getPhoto);
  server.put('/users/:email/photo', users.validateUser(ELEMENT, 'UPDATE'), users.savePhoto);
  // cloud service routes - adding/removing service is considerd an Update operation
  server.get('/users/:email/service', users.validateUser(ELEMENT, 'READ'), users.getService);
  server.get('/users/:email/service/:serviceName', users.validateUser(ELEMENT, 'READ'), users.getService);
  server.post('/users/:email/service', users.validateUser(ELEMENT, 'UPDATE'), users.createService);
  server.del('/users/:email/service/:serviceName', users.validateUser(ELEMENT, 'UPDATE'), users.deleteService);
};
