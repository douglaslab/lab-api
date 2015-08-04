'use strict';

module.exports = function(server, dbUp) {
  server.get('/health', (req, res) => {
    let recentVersion = Array.isArray(server.versions) ? server.versions[server.versions.length - 1] : server.versions;
    var status = {
      name: server.name,
      version: recentVersion,
      online: dbUp,
      message: '',
      platform: process.platform,
      architecture: process.arch,
      memoryUsage: process.memoryUsage()
    };
    if(dbUp) {
      res.send(200, {error: false, data: status});
    }
    else {
      status.message = 'service down: cannot connect to database';
      res.send(500, {error: true, data: status});
    }
  });

  server.on('NotFound', (req, res) => {
    if(dbUp) {
      res.send(404, {error: true, data: req.url + ' does not exist'});
    }
    else {
      res.send(500, {error: true, data: 'service down: cannot connect to database'});
    }
  });
};
