import * as chai from 'chai';
import { Request } from 'express';

import RequestAdatper from '../adapters/request-adapter';

chai.should();

describe('RequestAdatper', () => {

    describe('generateFilter', () => {
        let mockReq: Request | any;

        beforeEach(() => {
            mockReq = {
                query: {
                    match: { }
                },
                headers: { }
            }
        }); 

        it('should filter by match type', () => {
            mockReq.query.match.type = 'foo-bar,second';          
            const result = RequestAdatper.generateFilter(mockReq);
            result.should.have.property('stix.type');
            result['stix.type'].should.have.property('$in').with.lengthOf(2);
            result['stix.type']['$in'][0].should.equal('foo-bar');
            result['stix.type']['$in'][1].should.equal('second');
        });

        it('should filter by match id', () => {
            mockReq.query.match.id = 'foo-bar,second';
            const result = RequestAdatper.generateFilter(mockReq);
            result.should.have.property('_id');
            result['_id'].should.have.property('$in').with.lengthOf(2);
            result['_id']['$in'][0].should.equal('foo-bar');
            result['_id']['$in'][1].should.equal('second');
        });

        it('should filter by x-taxii-date-added-first', () => {
            mockReq.headers['x-taxii-date-added-first'] = '2018-05-02T19:32:50.926Z';
            const result = RequestAdatper.generateFilter(mockReq);
            result.should.have.property('stix.created');
            result['stix.created'].should.have.property('$gte');
            result['stix.created']['$gte'].getTime().should.equal((new Date('2018-05-02T19:32:50.926Z')).getTime());
        });

        it('should filter by x-taxii-date-added-last', () => {
            mockReq.headers['x-taxii-date-added-last'] = '2018-05-02T19:32:50.926Z';
            const result = RequestAdatper.generateFilter(mockReq);
            result.should.have.property('stix.created');
            result['stix.created'].should.have.property('$lte');
            result['stix.created']['$lte'].getTime().should.equal((new Date('2018-05-02T19:32:50.926Z')).getTime());
        });

        it('should filter by all parameters', () => {
            mockReq.query.match.id = '1234,5678';
            mockReq.query.match.type = 'foo-bar,second'; 
            mockReq.headers['x-taxii-date-added-first'] = '2018-03-02T19:32:50.926Z';
            mockReq.headers['x-taxii-date-added-last'] = '2018-06-02T19:32:50.926Z';
            const result = RequestAdatper.generateFilter(mockReq);

            result['stix.type'].should.have.property('$in').with.lengthOf(2);
            result['stix.type']['$in'][0].should.equal('foo-bar');
            result['stix.type']['$in'][1].should.equal('second');

            result['_id'].should.have.property('$in').with.lengthOf(2);
            result['_id']['$in'][0].should.equal('1234');
            result['_id']['$in'][1].should.equal('5678');

            result.should.have.property('stix.created');
            result['stix.created'].should.have.property('$gte');
            result['stix.created']['$gte'].getTime().should.equal((new Date('2018-03-02T19:32:50.926Z')).getTime());

            result.should.have.property('stix.created');
            result['stix.created'].should.have.property('$lte');
            result['stix.created']['$lte'].getTime().should.equal((new Date('2018-06-02T19:32:50.926Z')).getTime());
        });

    });

});
