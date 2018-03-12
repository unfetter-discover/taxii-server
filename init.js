const mongoose = require('mongoose');
let config = require('./config');
const testConfig = require('./test/config');
const validate = require('uuid-validate');
let collections = require('./collections');
const testCollections = require('./test/collections');

const invalidUUIDError = require('./errors/invalid-uuid');

if (process.env.NODE_ENV === 'test') {
  config = testConfig;
  collections = testCollections;
}

const discovery = Object.getOwnPropertyDescriptor(config, 'discovery');
let apiRoot = discovery.value.default.split('/').pop();

mongoose[`${apiRoot}_conn`] = mongoose.createConnection(config.connection_string + apiRoot);
for (let i = 0; i < discovery.value.api_roots.length; i += 1) {
  apiRoot = discovery.value.api_roots[i].split('/').pop();
  mongoose[`${apiRoot}_conn`] = mongoose.createConnection(config.connection_string + apiRoot);
}

for (let i = 0; i < collections.stix.collections.length; i += 1) {
  if (!validate(collections.stix.collections[i].id)) {
    throw (invalidUUIDError);
  }
}

module.exports = mongoose;
