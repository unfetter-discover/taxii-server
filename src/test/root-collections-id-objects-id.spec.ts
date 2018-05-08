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

describe('/GET :root/collections/:id/objects/:objectid', () => {
  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects/course-of-action--7c1796c7-9fc3-4c3e-9416-527295bf5d95', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects/course-of-action--7c1796c7-9fc3-4c3e-9416-527295bf5d95')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .end((err, res) => {
        res.body.objects.should.have.length(2);
        res.body.should.have.property('type', 'bundle');
        res.body.should.have.property('id');
        res.body.should.have.property('spec_version', config.bundle_spec_version);
        res.body.should.have.property('objects');
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < res.body.objects.length; i += 1) {
          res.body.objects[i].should.have.property('id', 'course-of-action--7c1796c7-9fc3-4c3e-9416-527295bf5d95');
        }
        res.should.have.status(200)
        done();
      })
  })
  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects/course-of-action--7c1796c7-9fc3-4c3e-9416-527295bf5d95 with version 2017-12-14T16:55:59.600Z', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects/course-of-action--7c1796c7-9fc3-4c3e-9416-527295bf5d95?match[version]=2017-12-14T16:55:59.600Z')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .end((err, res) => {
        res.body.objects.should.have.length(1);
        res.body.should.have.property('type', 'bundle');
        res.body.should.have.property('id');
        res.body.should.have.property('spec_version', config.bundle_spec_version);
        res.body.should.have.property('objects');
        res.body.objects[0].should.have.property('modified', '2017-12-14T16:55:59.600Z')
        res.should.have.status(200)
        done();
      })
  })
  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects/course-of-action--7c1796c7-9fc3-4c3e-9416-527295bf5d95 with version 2017-12-15T16:55:59.600Z', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects/course-of-action--7c1796c7-9fc3-4c3e-9416-527295bf5d95?match[version]=2017-12-15T16:55:59.600Z')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .end((err, res) => {
        res.body.objects.should.have.length(1);
        res.body.should.have.property('type', 'bundle');
        res.body.should.have.property('id');
        res.body.should.have.property('spec_version', config.bundle_spec_version);
        res.body.should.have.property('objects');
        res.body.objects[0].should.have.property('modified', '2017-12-15T16:55:59.600Z')
        res.should.have.status(200)
        done();
      })
  })
  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects/course-of-action--7c1796c7-9fc3-4c3e-9416-527295bf5d95 with version undefined', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects/course-of-action--7c1796c7-9fc3-4c3e-9416-527295bf5d95?match[version]=undefined')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
  })
  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects/course-of-action--7c1796c7-9fc3-4c3e-9416-527295bf5d95 with an invalid content type (error 406)', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects/course-of-action--7c1796c7-9fc3-4c3e-9416-527295bf5d95')
      .end((err, res) => {
        res.should.have.status(406)
        done();
      })
  })
  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects/undefined (error 404)', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects/undefined')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(404)
        done();
      })
  })
  it('it should GET objects from /stix/collections/undefined/objects/course-of-action--7c1796c7-9fc3-4c3e-9416-527295bf5d95 (error 404)', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/undefined/course-of-action--7c1796c7-9fc3-4c3e-9416-527295bf5d95')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(404)
        done();
      })
  })
  it('it should GET objects from /undefined/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects/course-of-action--7c1796c7-9fc3-4c3e-9416-527295bf5d95 (error 404)', (done) => {
    chai.request(server)
      .get('/undefined/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects/course-of-action--7c1796c7-9fc3-4c3e-9416-527295bf5d95')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(404)
        done();
      })
  })
})
