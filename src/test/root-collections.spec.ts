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

describe('/GET :root/collections', () => {
    it('it should GET /stix collections info', (done) => {
        chai.request(server)
            .get('/stix/collections')
            .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
            .end((err: any, res: any) => {
                res.should.have.status(200);
                res.should.have.header('content-type', 'application/vnd.oasis.taxii+json; charset=utf-8; version=2.0');
                res.should.be.a('object');
                res.body[0].should.have.property('id', '95ecc380-afe9-11e4-9b6c-751b66dd541e');
                res.body[0].should.have.property('title', 'Enterprise ATT&CK');
                res.body[0].should.have.property('description', 'This data collection holds STIX objects from Enterprise ATT&CK');
                res.body[0].should.have.property('can_read', 'true');
                res.body[0].should.have.property('can_write', 'false');
                res.body[0].should.have.property('media_types');
                done();
            })
    })
    it('it should GET /stix collections info using pagination', (done) => {
        chai.request(server)
            .get('/stix/collections')
            .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
            .set('range', 'items=0-1')
            .end((err: any, res: any) => {
                res.should.have.status(206);
                res.should.have.header('content-type', 'application/vnd.oasis.taxii+json; charset=utf-8; version=2.0');
                res.should.be.a('object');
                res.body.should.have.length(2);
                res.body[0].should.have.property('id', '95ecc380-afe9-11e4-9b6c-751b66dd541e');
                res.body[0].should.have.property('title', 'Enterprise ATT&CK');
                res.body[0].should.have.property('description', 'This data collection holds STIX objects from Enterprise ATT&CK');
                res.body[0].should.have.property('can_read', 'true');
                res.body[0].should.have.property('can_write', 'false');
                res.body[0].should.have.property('media_types');
                done();
            })
    })
    it('it should GET /stix collections info using pagination with an invalid range of integers (error 416)', (done) => {
        chai.request(server)
            .get('/stix/collections')
            .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
            .set('range', 'items=20-30')
            .end((err: any, res: any) => {
                res.should.have.status(416);
                done();
            })
    })
    // TODO fix this test
    // it('it should GET /stix collections info using pagination with invalid syntax in the range header (error 500)', (done) => {
    //   chai.request(server)
    //     .get('/stix/collections')
    //     .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
    //     .set('range', 'foo=-20-xyz')
    //     .end((err: any, res: any) => {
    //       res.should.have.status(500);
    //       done();
    //     })
    // })
    it('it should GET /stix collections info with an invalid content type (error 406)', (done) => {
        chai.request(server)
            .get('/stix/collections')
            .set('range', 'items=20-30')
            .end((err: any, res: any) => {
                res.should.have.status(406);
                done();
            })
    })
    it('it should GET /undefined collections info (error 404)', (done) => {
        chai.request(server)
            .get('/undefined/collections')
            .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
            .end((err: any, res: any) => {
                res.should.have.status(404);
                done();
            })
    })
});
