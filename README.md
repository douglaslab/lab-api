# DLIMS
A RESTful API for Douglas Lab Inventory Management System.

## Installation

### Pre-requisits

The following need to be installed on your dev machine, in order to develop/test DLIMS.
You can either install them directly from their sites, or using a package manager like [brew](http://brew.sh/) for Mac, or [chocolatey](https://chocolatey.org/) for Windows.

1. Install [Git](http://git-scm.com/downloads).
1. Install Node and NPM from the [site](https://nodejs.org/download/) or [package manager](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager).
1. Install [MongoDB](http://www.mongodb.org/downloads).
1. Install the following modules globally: eslint, mocha, npmlist, nodemon
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

1. To run the service, type `npm start`.
1. To run the service continuously for development, type `nodemon`.
1. To run tests, type `npm test`.
1. To lint the code, type `npm run lint`.
1. To start the server, after linting, type `npm run dev`.
1. Once the server is running, open a browser, and browse to [localhost:3000](http://localhost:3000).
1. I recommend getting a REST client for your browser (like [Advanced Rest client](https://chrome.google.com/webstore/detail/advanced-rest-client/hgmloofddffdnphfgcellkdfbfbjeloo/reviews?hl=en-US) for Chrome), to test the rest of the API.

## Technology stack

- [Node.JS](https://nodejs.org/) - V8 based JavaScript server engine. Used with the `--harmony` flag, to allow ES6 features.
- [MongoDB](https://www.mongodb.org/) - NoSQL database.
- [Restify](http://mcavage.me/node-restify/) - framework for RESTful services.
- [Mongoose](http://mongoosejs.com/index.html) - ODM for MongoDB.
- [Mocha](http://mochajs.org) + [SuperTest](https://www.npmjs.com/package/supertest) + [Should](https://www.npmjs.com/package/should) - for a mixture of TDD and BDD testing.
