'use strict';

module.exports = function(server) {
  var users = require('../models/users');
  var admin = require('../models/admin');

  server.get('/admin/audit', users.validateUser('ADMIN'), admin.getAuditLog);
  server.get('/admin/permission', users.validateUser('ADMIN'), admin.getPermissions);
  server.post('/admin/permission', users.validateUser('ADMIN'), admin.createPermission);
};
