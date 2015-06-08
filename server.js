'use strict';

var debug = require('debug')('server');
var restify = require('restify');
var config = require('./configs');
var mongoose = require('mongoose');
var server = restify.createServer({
  name: config.service.name,
  version: config.service.version
});

//Allow cross origins access
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  return next();
});

//Server helpers
server.use(restify.acceptParser(server.acceptable))
  .use(restify.queryParser({mapParams: false}))
  .use(restify.bodyParser({mapParams: false}))
  .use(restify.authorizationParser())
  .use(restify.fullResponse())
  .pre(restify.pre.sanitizePath());

//database connection
mongoose.connect(config.db.connection);
mongoose.connection.on('error', (err) => {
  console.error('connection error:', err.message);
  require('./routes/global')(server, false);
});

mongoose.connection.on('open', () => {
  debug('Connected to %s db: %s:%s', config.db.name, mongoose.connections[0].host, mongoose.connections[0].port);
  //only add routes if db is connected
  require('./routes/global')(server, true);
  require('./routes/items')(server);
  require('./routes/users')(server);
});


server.listen(process.env.PORT || 3000, () => {
  debug('%s listening at %s', server.name, server.url.replace('[::]', 'localhost'));
});

module.exports = server;
