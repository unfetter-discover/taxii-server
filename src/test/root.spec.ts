process.env.NODE_ENV = 'test';

// NOTE ES6 import doesnt work for chai-http
// import * as chaiHttp from 'chai-http';
// tslint:disable-next-line:no-var-requires
const chaiHttp = require('chai-http');

import * as chai from 'chai';
import * as _config from './config.json';
import * as server from '../server/server';

const should = chai.should();
const expect = chai.expect;
const config: any = _config;

chai.use(chaiHttp);

describe('/GET :root', () => {
    config.autogenerate_roots = 0;
    it('it should GET /stix API root info (manually defined)', (done) => {
        chai.request(server)
            .get('/stix')
            .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
            .end((err: any, res: any) => {
                res.should.have.status(200);
                res.should.have.header('content-type', 'application/vnd.oasis.taxii+json; charset=utf-8; version=2.0');
                res.should.be.a('object');
                res.body.should.have.property('title', 'Default API root');
                res.body.should.have.property('max_content_length', '10485760');
                res.body.should.have.property('versions');
                done();
            });
    });
    config.autogenerate_roots = 1;
    it('it should GET /stix API root info (automatically defined)', (done) => {
        chai.request(server)
            .get('/stix')
            .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
            .end((err: any, res: any) => {
                res.should.have.status(200);
                res.should.have.header('content-type', 'application/vnd.oasis.taxii+json; charset=utf-8; version=2.0');
                res.should.be.a('object');
                res.body.should.have.property('title', 'Default API root');
                res.body.should.have.property('description', 'This API root contains...');
                res.body.should.have.property('max_content_length', '10485760');
                res.body.should.have.property('versions');
                done();
            })
    })
    it('it should GET /stix API root info with an invalid content type (error 406)', (done) => {
        chai.request(server)
            .get('/stix')
            .end((err, res) => {
                res.should.have.status(406);
                done();
            })
    })
    it('it should GET /undefined API root info (error 404)', (done) => {
        chai.request(server)
            .get('/undefined')
            .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
            .end((err: any, res: any) => {
                res.should.have.status(404);
                done();
            })
    })
});
