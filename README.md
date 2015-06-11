# DLIMS
A RESTful API for Douglas Lab Inventory Management System.<br>
Developers: jump to [installation instructions](#installation).

## The API

The API runs at the root (`/`) of the server. *(We have not decided yet how to treat the root itself)*
To use the API, an authentication header must be provided by the client (see [Authorization](#authorization).<br>
Currently supported endpoints:

### `/items` - inventory endpoint

- `GET /items` - get all items fitting the search criteria.
  - Permission required: `USER`
  - Possible reponse codes:
      - 200 - success. Returns array of items in JSON format.
      - 401 - invalid token.
      - 403 - permission denied.
      - 500 - server error.
  - Search criteria:
      - values are specified as a query string in the form of `field1=value1&field2=value2...`
      - `operator=or|and` - (`and` by default)
      - `ignorecase=false|true` - (`true` by default)
      - if the search string is missing, all items will be returned
- `GET /items/:id` - get item by the id provided.
  - Permission required: `USER`
  - Possible reponse codes:
      - 200 - success. Returns item in JSON format.
      - 401 - invalid token.
      - 403 - permission denied.
      - 404 - item not found.
      - 500 - server error.
- `POST /items` - create a new item. Item properties are provided in the request body.
  - Permission required: `USER`
  - Possible reponse codes:
      - 201 - success. Returns new item in JSON format.
      - 400 - malformed input
      - 401 - invalid token.
      - 403 - permission denied.
      - 500 - server error.
- `PUT /items/:id` - update an item. Updated item properties are provided in the request body.
  - Permission required: `USER`
  - Possible reponse codes:
      - 200 - success. Returns updated item in JSON format.
      - 400 - malformed input
      - 401 - invalid token.
      - 403 - permission denied.
      - 404 - item not found.
      - 500 - server error.
  - Note: this adds new properties, or replaces existing properties, but does not remove properties.
- `PUT /items/:id/true` - replace all properties of an item. Updated item properties are provided in the request body.
  - Permission required: `USER`
  - Possible reponse codes:
      - 200 - success. Returns updated item in JSON format.
      - 400 - malformed input
      - 401 - invalid token.
      - 403 - permission denied.
      - 404 - item not found.
      - 500 - server error.
  - Note: this replaces all existing properties with provided properties.
- `DELETE /items/:id` - delete an item.
  - Permission required: `USER`
  - Possible reponse codes:
      - 200 - success.
      - 401 - invalid token.
      - 403 - permission denied.
      - 404 - item not found.
      - 500 - server error.

### `/users` - users endpoint

- `GET /users` - get all users.
  - Permission required: `MANAGER`
  - Possible reponse codes:
      - 200 - success. Returns array of users in JSON format.
      - 401 - invalid token.
      - 403 - permission denied.
      - 500 - server error.
- `GET /users/:id` - get user by the id provided.
  - Permission required: `MANAGER`
  - Possible reponse codes:
      - 200 - success. Returns user in JSON format.
      - 401 - invalid token.
      - 403 - permission denied.
      - 404 - user not found.
      - 500 - server error.
- `POST /users` - create a new user. User properties are provided in the request body.
  - Permission required: `MANAGER`
  - Possible reponse codes:
      - 201 - success. Returns new user in JSON format.
      - 400 - malformed input
      - 401 - invalid token.
      - 403 - permission denied.
      - 500 - server error.
- `PUT /users/:id` - update a user. Updated user properties are provided in the request body.
  - Permission required: `MANAGER`
  - Possible reponse codes:
      - 200 - success. Returns updated user in JSON format.
      - 400 - malformed input
      - 401 - invalid token.
      - 403 - permission denied.
      - 404 - user not found.
      - 500 - server error.
- `DELETE /users/:id` - delete a user.
  - Permission required: `MANAGER`
  - Possible reponse codes:
      - 200 - success.
      - 401 - invalid token.
      - 403 - permission denied.
      - 404 - user not found.
      - 500 - server error.
- `POST /users/login` - authenticate a user. Email and password are provided in the `Authorization` HTTP header (see [Authentication](#authentication)). Upon successful login, wil return the user object.
  - Permission required: **none**
  - Possible response codes:
      - 200 - success.
      - 401 - incorrect email or password
      - 404 - user not found.
      - 500 - server error.

### `/health` - service statistics endpoint

- `GET /health` - gets the current status of the service, along with service statistics.
  - Permission required: **none**
  - Possible response codes:
      - 200 - success.
      - 500 - server error.

### Authorization

To use the API, the client must provide the `X-API-Authorization` HTTP header, containing:
- `key` - The user's API key
- `ts` - The current timesatmp, in seconds
- `token` - the calculated token, based on the API key, secret and timestamp

The following code shows how to construct the header:

```node
var util = require('util');
var crypto = require('crypto');
var ts = parseInt((new Date()).getTime() / 1000, 10);
var hmac = crypto.createHmac('sha1', apiSecret).update(apiKey).digest('hex');
var token = crypto.createHash('md5').update(hmac + ts).digest('hex');
var header = {'X-API-Authorization': util.format('key=%s, token=%s, ts=%s', apiKey, token, timestamp)};
```

### Authentication

To log in to the system, the client needs to provide the user's email and password in the `Authrization` header.
The following code shows how to construct the header:

```node
var util = require('util');
var hash = new Buffer(util.format('%s:%s', email, password)).toString('base64');
var header = {'Authorization': util.format('Basic %s', hash)};
```

## Installation

### Pre-requisits

The following need to be installed on your dev machine, in order to develop/test DLIMS.
You can either install them directly from their sites, or using a package manager like [brew](http://brew.sh/) for Mac, or [chocolatey](https://chocolatey.org/) for Windows.

1. Install [Git](http://git-scm.com/downloads).
1. Install Node and NPM from the [site](https://nodejs.org/download/) or [package manager](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager).
1. Install [MongoDB](http://www.mongodb.org/downloads).
1. Install the following modules globally: eslint, mocha, npmlist, jsdoc, nodemon
```console
$ npm i -g eslint mocha npmlist nodemon  #you may need to use sudo
```

### Preparations

1. Run MongoDB, connect to it, and create a database called `dlims`.
Instruction on how to start using MongoDB can be found [here](http://docs.mongodb.org/getting-started/node/introduction/).
1. Fork the repo to your GitHub account
1. Clone the repo to your machine, and install the required modules :
```console
$ git clone git@github.com:<your github user name>/alpha-dev.git
$ cd alpha-dev
$ #if you want to build the dev branch, run git checkout dev
$ npm i
```

## Running the service

1. To run the service, type `npm start` (or `npm run dev` to lint the code prior to running).
1. To run the service continuously for development, type `nodemon`.
1. Once the server is running, open a browser, and browse to [localhost:3000](http://localhost:3000).
1. Use a REST client for your browser (like [Advanced Rest client](https://chrome.google.com/webstore/detail/advanced-rest-client/hgmloofddffdnphfgcellkdfbfbjeloo/reviews?hl=en-US) for Chrome), to test the rest of the API.

## Testing, linting, documentation

1. To run all tests, type `npm test`.
1. To run a specific test, type `mocha --harmony tests/<test name>`.
1. To lint the code, type `npm run lint`.
1. To generate documentation, type `npm run doc` and then open [docs/index.html](./docs/index.html) in your browser.

## Technology stack

- [Node.JS](https://nodejs.org/) - V8 based JavaScript server engine. Used with the `--harmony` flag, to allow ES6 features.
- [MongoDB](https://www.mongodb.org/) - NoSQL database.
- [Restify](http://mcavage.me/node-restify/) - framework for RESTful services.
- [Mongoose](http://mongoosejs.com/index.html) - ODM for MongoDB.
- [Mocha](http://mochajs.org) + [SuperTest](https://www.npmjs.com/package/supertest) + [Should](https://www.npmjs.com/package/should) - for a mixture of TDD and BDD testing.
- [JSDoc](http://usejsdoc.org/) - for automatic documentation
