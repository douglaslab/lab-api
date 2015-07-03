'use strict';

module.exports = (function() {
  let db;
  if(process.env.NODE_ENV === 'development' && !process.env.DB_CONNECTION) {
    db = {name: 'Local', connection: 'mongodb://localhost/dlab'};
  }
  else {
    db = {name: process.env.NODE_ENV, connection: process.env.DB_CONNECTION};
  }
  return db;
}());


//"mongodb://bioadmin:TVrbzfpbk60W7vctR3FC@ds034878.mongolab.com:34878/bionano"
