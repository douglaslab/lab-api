'use strict';

//helper function to start the service for tests
//The environment variable makes it reentrant
module.exports = function(done) {
  if(!process.env.TEST_URL) {
    var server = require('../server');
    //give the server 1/2 a second to start
    setTimeout(() => {
      process.env.TEST_URL = server.url.replace('[::]', 'localhost');
      done();
    }, 500);
  }
  else {
    done();
  }
};
