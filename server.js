'use strict';

var debug = require('debug')('server');
var restify = require('restify');
var Logger = require('bunyan');
var mongoose = require('mongoose');
var db = require('./configs/db');
var service = require('./configs/service');

var server = restify.createServer({
  name: service.name,
  version: service.version,
  log: new Logger({name: service.name})
});
debug(service);

//Allow cross origins access
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  return next();
});

//Server helpers
server.use(restify.acceptParser(server.acceptable))
  .use(restify.gzipResponse())
  .use(restify.queryParser({mapParams: false}))
  .use(restify.bodyParser({mapParams: false}))
  .use(restify.authorizationParser())
  .use(restify.fullResponse())
  .pre(restify.pre.sanitizePath());

//database connection
mongoose.connect(db.connection);
mongoose.connection.on('error', (err) => {
  server.log.error('connection error:', err.message);
  require('./routes/global')(server, false);
});

mongoose.connection.on('open', () => {
  server.log.info('Connected to %s db: %s:%s', db.name, mongoose.connections[0].host, mongoose.connections[0].port);
  //only add routes if db is connected
  require('./routes/global')(server, true);
  require('./routes/items')(server);
  require('./routes/users')(server);
  require('./routes/admin')(server);
});


server.listen(process.env.PORT || 3000, () => {
  server.log.info('%s listening at %s', server.name, server.url.replace('[::]', 'localhost'));
});

module.exports = server;
