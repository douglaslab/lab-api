/* eslint-disable no-process-exit */
'use strict';

var async = require('async');

var connectDB = function(callback) {
  var db = require('../configs/db');
  var mongoose = require('mongoose');

  mongoose.connect(db.connection);
  mongoose.connection.on('open', callback);
  mongoose.connection.on('error', (err) => {
    console.error('connection error:', err.message);
  });
};

var createDefaultAdminUser = function(callback) {
  var UserModel = require('../models/schemas/user');
  var security = require('../models/security');
  var user = {
    email: process.env.ADMIN_EMAIL || 'test@ucsf.edu',
    name: 'System Admin',
    school: '',
    password: security.hashPassword(process.env.ADMIN_PASSWORD || 'password'),
    apiKey: security.generateRandomBytes(32),
    apiSecret: security.generateRandomBytes(32),
    permissionLevel: 'ADMIN'
  };
  UserModel.findOneAndUpdate({email: user.email}, user, {upsert: true}, (err) => {
    if(err) {
      console.error(err);
    }
    callback();
  });
};

var resetPermissions = function(callback) {
  var PermissionModel = require('../models/schemas/permission');
  var entities = require('../configs/service').entities;
  var levels = [
    //Create, Read, Update, delete
    ['USER', 'USER', 'USER', 'USER'],         //item
    ['ADMIN', 'MANAGER', 'ADMIN', 'ADMIN'],   //user
    ['ADMIN', 'ADMIN', 'ADMIN', 'ADMIN'],     //permission
    ['USER', 'MANAGER', 'MANAGER', 'MANAGER'] //log
  ];
  var permissions = [];

  for(let i in entities.elements) {
    for(let j in entities.actions) {
      permissions.push({
        element: entities.elements[i],
        action: entities.actions[j],
        permissionRequired: levels[i][j]
      });
    }
  }
  async.each(permissions, function(permission, cb) {
    PermissionModel.findOneAndUpdate(
      {element: permission.element, action: permission.action},
      permission,
      {upsert: true, new: true},
      (err) => {
        if(err) {
          console.error(err);
        }
        cb();
    });
  }, () => callback());
};

var main = function() {
  async.series([
    (callback) => connectDB(() => {console.log('connected to db'); callback(); }),
    (callback) => createDefaultAdminUser(() => {console.log('created default admin user'); callback(); }),
    (callback) => resetPermissions(() => {console.log('reset entities permissions'); callback(); })
  ], () => {console.log('Done!'); process.exit(0); });

};

main();
