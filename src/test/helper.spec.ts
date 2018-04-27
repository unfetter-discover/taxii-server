import { Request } from 'express';
import Helper from '../server/helper';

import * as _config from '../assets/config.json';
import { expect } from 'chai';
const config: any = _config;

describe('Helper', () => {

    let mockReq: Request | any = {
        headers: {
            accept: config.accepts[0]
        }
    };

    describe('isValidContentType', () => {
        it('should return true for type taxii', () => {
            const result = Helper.isValidContentType(mockReq, 'taxii');
            // tslint:disable-next-line:no-unused-expression
            expect(result).to.be.true;
        });
        it('should return true for type stix', () => {
            const stixHeaderReq = {
                ...mockReq,
                headers: {
                    ...mockReq.headers,
                    accept: config.accepts[2]
                }
            };
            const result = Helper.isValidContentType(stixHeaderReq, 'stix');
            // tslint:disable-next-line:no-unused-expression
            expect(result).to.be.true;
        });
        it('should return false for type fake', () => {
            const result = Helper.isValidContentType(mockReq, 'fake');
            // tslint:disable-next-line:no-unused-expression
            expect(result).to.be.false;
        });
        it('should return false for fake header', () => {
            const fakeHeaderReq = {
                ...mockReq,
                headers: {
                    ...mockReq.headers,
                    accept: 'fake'
                }
            };
            const result = Helper.isValidContentType(fakeHeaderReq, 'taxii');
            // tslint:disable-next-line:no-unused-expression
            expect(result).to.be.false;
        });
    });

});
