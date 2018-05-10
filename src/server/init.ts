import * as _mongoose from 'mongoose';
import * as uuidValidate from 'uuid-validate';

import * as invalidUUIDError from '../errors/invalid-uuid';
import config from '../services/config.service';

import * as _collections from '../assets/collections.json';
import * as testCollections from '../test/collections.json';

const mongoose: any = _mongoose;
let collections: any;

if (process.env.NODE_ENV === 'test') {
  collections = testCollections;
} else {
  collections = _collections;
}

const discovery = Object.getOwnPropertyDescriptor(config, 'discovery');
let apiRoot = discovery.value.default.split('/').pop();

mongoose[`${apiRoot}_conn`] = _mongoose.createConnection(config.connection_string + apiRoot);

discovery.value.api_roots.forEach((rawApiRoot: any) => {
  apiRoot = rawApiRoot.split('/').pop();
  mongoose[`${apiRoot}_conn`] = _mongoose.createConnection(config.connection_string + apiRoot);
});

collections.stix.collections.forEach((stixCollection: any) => {
  if (!uuidValidate(stixCollection.id)) {
    throw (invalidUUIDError);
  }
});

export default mongoose;
