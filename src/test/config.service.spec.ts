import * as chai from 'chai';

import { generateConfiguration } from '../services/config.service';

chai.should();

const savedMongoRepo = process.env.MONGO_REPOSITORY;
const savedMongoPort = process.env.MONGO_PORT;

describe('config Service', () => {
    afterEach(() => {
        process.env.MONGO_REPOSITORY = savedMongoRepo;
        process.env.MONGO_PORT = savedMongoPort;
    });

    it('should return default config', () => {
        const result = generateConfiguration({} as any);
        // tslint:disable-next-line:no-unused-expression
        result.should.exist;
    });

    it('should handle argv', () => {
        const mockArgv: any = {
            host: 'foo',
            port: '1234'
        };
        const result = generateConfiguration(mockArgv);
        result.mongo_host.should.equal(mockArgv.host);
        result.mongo_port.should.equal(mockArgv.port);
    });

    it('should handle environmental variables', () => {
        const host = 'foo';
        const port = '1234';
        process.env.MONGO_REPOSITORY = host;
        process.env.MONGO_PORT = port;
        const result = generateConfiguration({} as any);
        result.mongo_host.should.equal(host);
        result.mongo_port.should.equal(port);
    });

    it('should prioritize argv over environmental variables', () => {
        const mockArgv: any = {
            host: 'foo',
            port: '1234'
        };
        const host = 'bar';
        const port = '5678';
        process.env.MONGO_REPOSITORY = host;
        process.env.MONGO_PORT = port;
        const result = generateConfiguration(mockArgv);
        result.mongo_host.should.equal(mockArgv.host);
        result.mongo_port.should.equal(mockArgv.port);
    });
});
