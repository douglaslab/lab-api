'use strict';

module.exports = function(server) {
  var users = require('../models/users');
  var admin = require('../models/admin');

  server.get('/admin/audit', users.validateUser('LOG', 'READ'), admin.getAuditLog);
  server.get('/admin/permission', users.validateUser('PERMISSION', 'READ'), admin.getPermissions);
  server.post('/admin/permission', users.validateUser('PERMISSION', 'CREATE'), admin.createPermission);
};
