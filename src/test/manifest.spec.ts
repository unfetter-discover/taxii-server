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

describe('/GET :root/collections/:id/manifest', () => {
  it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.have.header('content-type', 'application/vnd.oasis.taxii+json; charset=utf-8; version=2.0');
        res.should.be.a('object');
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < res.body.length; i++) {
          res.body[i].should.have.property('id');
          res.body[i].should.have.property('date_added')
          res.body[i].should.have.property('versions')
          res.body[i].should.have.property('media_types')
        }
        done();
      })
  })
  it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest using pagination', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .set('range', 'items=0-1')
      .end((err, res) => {
        res.should.have.status(206);
        res.should.have.header('content-type', 'application/vnd.oasis.taxii+json; charset=utf-8; version=2.0');
        res.should.be.a('object');
        res.body.should.have.length(2);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < res.body.length; i++) {
          res.body[i].should.have.property('id');
          res.body[i].should.have.property('date_added')
          res.body[i].should.have.property('versions')
          res.body[i].should.have.property('media_types')
        }
        done();
      })
  })
  it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest using pagination with an invalid range of integers', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .set('range', 'items=60-70')
      .end((err, res) => {
        res.should.have.status(416);
        done();
      })
  })
//   it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest using pagination with invalid syntax in the range header (error 500)', (done) => {
//     chai.request(server)
//       .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest')
//       .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
//       .set('range', 'foo=-20-xyz')
//       .end((err, res) => {
//         res.should.have.status(500);
//         done();
//       })
//   })
  it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest with an invalid content type (error 406)', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest')
      .set('range', 'items=20-30')
      .end((err, res) => {
        res.should.have.status(406);
        done();
      })
  })
  it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest of only ID course-of-action--4f170666-7edb-4489-85c2-9affa28a72e0', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest?match[id]=course-of-action--4f170666-7edb-4489-85c2-9affa28a72e0')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(200);
        res.body[0].should.have.property('id', 'course-of-action--4f170666-7edb-4489-85c2-9affa28a72e0');
        done();
      })
  })
  it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest of IDs course-of-action--4f170666-7edb-4489-85c2-9affa28a72e0, attack-pattern--dcaa092b-7de9-4a21-977f-7fcb77e89c48', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest?match[id]=course-of-action--4f170666-7edb-4489-85c2-9affa28a72e0,attack-pattern--dcaa092b-7de9-4a21-977f-7fcb77e89c48')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(200);
        res.body[0].should.have.property('id', 'course-of-action--4f170666-7edb-4489-85c2-9affa28a72e0');
        res.body[1].should.have.property('id', 'attack-pattern--dcaa092b-7de9-4a21-977f-7fcb77e89c48');
        done();
      })
  })
  it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest of IDs invalid, attack-pattern--dcaa092b-7de9-4a21-977f-7fcb77e89c48', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest?match[id]=invalid,attack-pattern--dcaa092b-7de9-4a21-977f-7fcb77e89c48')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.length(1);
        res.body[0].should.have.property('id', 'attack-pattern--dcaa092b-7de9-4a21-977f-7fcb77e89c48');
        done();
      })
  })
  it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest of IDs invalid, foo (error 416)', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest?match[id]=invalid,foo')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(416);
        done();
      })
  })
  it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest of type attack-pattern', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest?match[type]=attack-pattern')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(200);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < res.body.length; i += 1) {
          res.body[i].should.have.property('id');
          // tslint:disable-next-line:no-unused-expression
          expect(res.body[i]['id'].startsWith('attack-pattern')).to.be.true;
        }
        done();
      })
  })
  it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest of types attack-pattern, course-of-action', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest?match[type]=attack-pattern,course-of-action')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(200);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < res.body.length; i += 1) {
          res.body[i].should.have.property('id');
          // tslint:disable-next-line:no-unused-expression
          expect((res.body[i]['id'].startsWith('attack-pattern') || res.body[i]['id'].startsWith('course-of-action'))).to.be.true;
        }
        done();
      })
  })
  it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest of types invalid, course-of-action', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest?match[type]=invalid,course-of-action')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(200);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < res.body.length; i += 1) {
          res.body[i].should.have.property('id');
          // tslint:disable-next-line:no-unused-expression
          expect(res.body[i]['id'].startsWith('course-of-action')).to.be.true;
        }
        done();
      })
  })
  it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest of types invalid, foo (error 416)', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest?match[type]=invalid,foo')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(416);
        done();
      })
  })
  it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest for all versions', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest?match[version]=all')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.length(52);
        done();
      })
  })
  it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest for latest versions', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest?match[version]=last')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        // this just checks that there are not duplicate IDs and may be expanded
        res.should.have.status(200);
        let isValid = true;
        for (let i = 1; i < res.body.length; i += 1) {
          if (res.body[i - 1].id === res.body[i].id) {
            isValid = false;
          }
        }
        expect(isValid).to.be.equal(true);
        done();
      })
  })
  it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest of first versions', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest?match[version]=first')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        // this just checks that there are not duplicate IDs and may be expanded
        res.should.have.status(200);
        let isValid = true;
        for (let i = 1; i < res.body.length; i += 1) {
          if (res.body[i - 1].id === res.body[i].id) {
            isValid = false;
          }
        }
        expect(isValid).to.be.equal(true);
        done();
      })
  })
  it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest for version 2017-12-14T16:55:59.600Z', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest?match[version]=2017-12-14T16:55:59.600Z')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(200);
        let isValid = true;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < res.body.length; i += 1) {
          if (res.body[i].versions[0] !== '2017-12-14T16:55:59.600Z') {
            isValid = false;
          }
        }
        expect(isValid).to.be.equal(true);
        done();
      })
  })
  it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest for versions 2017-12-14T16:55:59.600Z, 2017-12-15T16:55:59.600Z', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest?match[version]=2017-12-14T16:55:59.600Z,2017-12-15T16:55:59.600Z')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .set('range', 'items=2-52')
      .end((err, res) => {
        res.should.have.status(206);
        let isValid = true;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < res.body.length; i += 1) {
          if (res.body[i].versions[0] !== '2017-12-14T16:55:59.600Z' && res.body[i].versions[0] !== '2017-12-15T16:55:59.600Z') {
            isValid = false;
          }
        }
        expect(isValid).to.be.equal(true);
        done();
      })
  })
  it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest for version foo (error 416)', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest?match[version]=foo')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(416);
        done();
      })
  })
  it('it should GET manifest from /undefined/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest (error 404)', (done) => {
    chai.request(server)
      .get('/undefined/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
  })
  it('it should GET manifest from /stix/collections/undefined/manifest (error 404)', (done) => {
    chai.request(server)
      .get('/stix/collections/undefined/manifest')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
  })
  it('it should GET manifest from /undefined/collections/undefined/manifest (error 404)', (done) => {
    chai.request(server)
      .get('/undefined/collections/undefined/manifest')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
  })
})
