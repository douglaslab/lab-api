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
  .use(restify.queryParser())
  .use(restify.authorizationParser())
  .use(restify.bodyParser({mapParams: false}))
  .use(restify.fullResponse())
  .pre(restify.pre.sanitizePath());

//TODO: REMOVE THIS return message when hitting root
server.get('/', (req, res) => {
  //TODO: change to 404 or 401
  let recentVersion = Array.isArray(server.versions) ? server.versions[server.versions.length - 1] : server.versions;
  res.send(200, {message: 'Welcome to ' + server.name + ' version ' + recentVersion});
});

//database connection
mongoose.connect(config.db.connection);
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.on('open', () => {
  debug('Connected to db: %s:%s', mongoose.connections[0].host, mongoose.connections[0].port);
  //only add routes if db is connected
  require('./routes/items')(server);
});


server.listen(process.env.PORT || 3000, () => {
  debug('%s listening at %s', server.name, server.url.replace('[::]', 'localhost'));
});

module.exports = server;
