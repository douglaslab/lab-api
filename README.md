# Douglas Lab API

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/douglaslab/lab-api)

A RESTful API for Douglas Lab Information Management System.

**Update 9/11/2015:** Lab-API now requires Node 4.0. This means we no longer need the `--harmony` flags all over, because ES2015 (formerly ES6) is fully supported!

Developers: jump to [installation instructions](#installation).

## The API

The API runs at the root (`/`) of the server. *(The root itself returns an error)*.

For a full documentation of the available endpoints and functionality, please refer to our [Swagger documentation](http://douglaslab.github.io/lab-api/). It is hosted on the [gh-pages branch](https://github.com/douglaslab/lab-api/tree/gh-pages) of this repo.

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

To log in to the system, the client needs to provide the user's email and password in the `Authorization` header.
The following code shows how to construct the header:

```node
var util = require('util');
var hash = new Buffer(util.format('%s:%s', email, password)).toString('base64');
var header = {'Authorization': util.format('Basic %s', hash)};
```

### Permissions required

A permission is a 3-tuple of {element, action, permission level required}.

Currently, there system recognizes:
- 4 types of elements (item, user, permission, log)
- 4 types of actions (create, read, update, delete)
- 3 types of permission levels (user, manager, admin)

The default permission matrix is:

|                | CREATE   | READ    | UPDATE  | DELETE  |
|----------------|----------|---------|---------|---------|
| **ITEM**       | USER     | USER    | USER    | USER    |
| **USER**       | MANAGER  | MANAGER | MANAGER | ADMIN   |
| **PERMISSION** | ADMIN    | ADMIN   | ADMIN   | N/A     |
| **LOG**        | N/A      | MANAGER | MANGER  | MANAGER |

The exception to the rule is: a user can READ and UPDATE **their own** USER element.

## Installation

### Pre-requisites

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
$ git clone git@github.com:<your github user name>/lab-api.git
$ cd lab-api
$ #if you want to build the dev branch, run git checkout dev
$ npm i
```

### Bootstraping the database

To fill the database with at least one admin-level user, and basic service permissions, run the bootstrap script from the scripts folder.
**Verify that your database is up and running before you run this!**

```console
$ node scripts/bootstrap
```

After running it, verify that your `users` and `permissions` collections are full.

**Tip**: you can run the script with `NODE_ENV=staging` or `NODE_ENV=production` to load the different databases but **make sure you know what you're doing as this operation is irreversible!**.

## Running the service

1. To run the service, type `npm start` (or `npm run dev` to lint the code prior to running).
1. To run the service continuously for development, type `nodemon`.
1. Once the server is running, open a browser, and browse to [localhost:3000](http://localhost:3000).
1. Use a REST client for your browser (like [Advanced Rest client](https://chrome.google.com/webstore/detail/advanced-rest-client/hgmloofddffdnphfgcellkdfbfbjeloo/reviews?hl=en-US) for Chrome), to test the rest of the API.

## Testing, linting, documentation

1. To run all tests, type `npm test`.
1. To run a specific test, type `mocha tests/<test name>`.
1. To lint the code, type `npm run lint`.
1. To generate documentation, type `npm run doc` and then open [docs/index.html](./docs/index.html) in your browser.

## Technology stack

- [Node.JS](https://nodejs.org/) - Now using v4.0 and up to make use of ES2015 features.
- [MongoDB](https://www.mongodb.org/) - NoSQL database.
- [Restify](http://mcavage.me/node-restify/) - framework for RESTful services.
- [Mongoose](http://mongoosejs.com/index.html) - ODM for MongoDB.
- [Mocha](http://mochajs.org) + [SuperTest](https://www.npmjs.com/package/supertest) + [Should](https://www.npmjs.com/package/should) - for a mixture of TDD and BDD testing.
- [JSDoc](http://usejsdoc.org/) - for automatic documentation
