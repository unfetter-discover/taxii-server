process.env.NODE_ENV = 'test';

// NOTE ES6 import doesnt work for chai-http
// import * as chaiHttp from 'chai-http';
// tslint:disable-next-line:no-var-requires
const chaiHttp = require('chai-http');

import * as chai from 'chai';
import * as server from '../server/server';
import config from '../services/config.service';

const should = chai.should();
const expect = chai.expect;

chai.use(chaiHttp);

describe('/GET :root/collections/:id', () => {
  it('it should GET the /stix collection with ID 95ecc380-afe9-11e4-9b6c-751b66dd541e', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.have.header('content-type', 'application/vnd.oasis.taxii+json; charset=utf-8; version=2.0');
        res.should.be.a('object');
        res.body.should.have.property('id', '95ecc380-afe9-11e4-9b6c-751b66dd541e');
        res.body.should.have.property('title', 'Enterprise ATT&CK');
        res.body.should.have.property('description', 'This data collection holds STIX objects from Enterprise ATT&CK');
        res.body.should.have.property('can_read', 'true');
        res.body.should.have.property('can_write', 'false');
        res.body.should.have.property('media_types');
        done();
      })
  })
  it('it should GET the /stix collection with ID 95ecc380-afe9-11e4-9b6c-751b66dd541e with an invalid content type (error 406)', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e')
      .end((err, res) => {
        res.should.have.status(406);
        done();
      })
  })
  it('it should GET the /stix collection with ID undefined (error 404)', (done) => {
    chai.request(server)
      .get('/stix/collections/undefined')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
  })
  it('it should GET the /undefined collection ID 95ecc380-afe9-11e4-9b6c-751b66dd541e (error 404)', (done) => {
    chai.request(server)
      .get('/undefined/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
  })
  it('it should GET the /stix collection with ID undefined (error 404)', (done) => {
    chai.request(server)
      .get('/stix/collections/undefined')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
  })
})
