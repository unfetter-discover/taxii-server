import * as _mongoose from 'mongoose';
import * as uuidValidate from 'uuid-validate';

import * as invalidUUIDError from '../errors/invalid-uuid';

import * as _config from '../assets/config.json';
import * as _collections from '../assets/collections.json';

import * as testConfig from '../test/config.json';
import * as testCollections from '../test/collections.json';

const mongoose: any = _mongoose;
let config: any;
let collections: any;

if (process.env.NODE_ENV === 'test') {
  config = testConfig;
  collections = testCollections;
} else {
  config = _config;
  collections = _collections;
}

const discovery = Object.getOwnPropertyDescriptor(config, 'discovery');
let apiRoot = discovery.value.default.split('/').pop();

mongoose[`${apiRoot}_conn`] = mongoose.createConnection(config.connection_string + apiRoot);

discovery.value.api_roots.forEach((rawApiRoot: any) => {
  apiRoot = rawApiRoot.split('/').pop();
  mongoose[`${apiRoot}_conn`] = mongoose.createConnection(config.connection_string + apiRoot);
});

collections.stix.collections.forEach((stixCollection: any) => {
  if (!uuidValidate(stixCollection.id)) {
    throw (invalidUUIDError);
  }
});

export default mongoose;
