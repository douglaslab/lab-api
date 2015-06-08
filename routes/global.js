'use strict';

module.exports = function(server, dbUp) {
  server.get('/health', (req, res) => {
    let recentVersion = Array.isArray(server.versions) ? server.versions[server.versions.length - 1] : server.versions;
    var status = {
      version: recentVersion,
      name: server.name,
      platform: process.platform,
      architecture: process.arch,
      memoryUsage: process.memoryUsage(),
      message: ''
    };
    if(dbUp) {
      status.up = true;
      res.send(200, {error: false, data: status});
    }
    else {
      status.up = false;
      status.message = 'Could not connect to database. Service requires restart.';
      res.send(500, {error: true, data: status});
    }
  });

};
