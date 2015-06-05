'use strict';

var getAllConfigs = function() {
  var readDir = require('readdir');
  var path = require('path');
  var env = process.env.NODE_ENV || 'development';
  var settings = {};

  for(let file of readDir.readSync(__dirname, ['**.json'])) {
    var contents = require(path.join(__dirname, file));
    settings[file.slice(0, -5)] = contents[env] || contents;
  }
  return settings;
};

module.exports = getAllConfigs();
