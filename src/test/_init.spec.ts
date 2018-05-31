process.env.NODE_ENV = 'TEST';

import * as chai from 'chai';
import MongooseModels from '../models/mongoose-models';
import mongoose from '../server/init';
import * as stixArray from './stix_array.json';
import config from '../services/config.service';

console.log('Initializing test data');

describe('initialize', () => {
    it('should load test data', (done) => {
        const apiRoot = config.discovery.api_roots[0];
        const model = MongooseModels.getStixModel(mongoose[`${apiRoot}_conn`]);

        model
            .remove({}, (err) => {
                if (err) {
                    throw err;
                }
                model
                    .insertMany(stixArray, (insertErr, results) => {
                        if (insertErr) {
                            throw insertErr;
                        }
                        done();
                    });
            });
    });
});
