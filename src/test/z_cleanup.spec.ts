import * as chai from 'chai';
import MongooseModels from '../models/mongoose-models';
import mongoose from '../server/init';
import * as _config from './config.json';
import * as stixArray from './stix_array.json';

const config: any = _config;

describe('cleanup', () => {
    it('should remove test data', (done) => {
        const apiRoot = config.discovery.api_roots[0];
        const model = MongooseModels.getStixModel(mongoose[`${apiRoot}_conn`]);

        model
            .remove({}, (err) => {
                if (err) {
                    throw err;
                }
                mongoose.connections.forEach((conn: any) => conn.close());
                if (global.server) {
                    global.server.close(() => {
                        console.log('Closing server');
                        done();
                    })
                } else {
                    done();
                }
            });
    });
});
