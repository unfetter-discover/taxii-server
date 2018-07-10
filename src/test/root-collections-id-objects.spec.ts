process.env.NODE_ENV = 'test';

// NOTE ES6 import doesnt work for chai-http
// import * as chaiHttp from 'chai-http';
// tslint:disable-next-line:no-var-requires
const chaiHttp = require('chai-http');

import * as chai from 'chai';

import config from '../services/config.service';
import * as server from '../server/server';
import { validateFirstVersionFilter, validateLastVersionFilter } from './test-helpers';

const should = chai.should();
const expect = chai.expect;

chai.use(chaiHttp);

describe('/GET :/root/collections/:id/objects', () => {
  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.have.header('content-type', 'application/vnd.oasis.stix+json; charset=utf-8; version=2.0');
        res.should.be.a('object');
        res.body.should.have.property('type', 'bundle');
        res.body.should.have.property('id');
        res.body.should.have.property('spec_version', config.bundle_spec_version);
        res.body.should.have.property('objects');
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < res.body.objects.length; i++) {
          res.body.objects[i].should.have.property('type');
          res.body.objects[i].should.have.property('id');
          res.body.objects[i].should.have.property('created_by_ref');
          res.body.objects[i].should.have.property('created');
          res.body.objects[i].should.have.property('modified');
          res.body.objects[i].should.have.property('name');
          res.body.objects[i].should.have.property('description');
          res.body.objects[i].should.have.property('external_references');
        }
        done();
      })
  })
  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects using pagination', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .set('range', 'items=0-1')
      .end((err, res) => {
        // console.log('~~~~', res);
        res.should.have.status(206);
        res.should.have.header('content-type', 'application/vnd.oasis.stix+json; charset=utf-8; version=2.0');
        res.should.be.a('object');
        res.body.should.have.property('type', 'bundle');
        res.body.should.have.property('id');
        res.body.should.have.property('spec_version', config.bundle_spec_version);
        res.body.should.have.property('objects');
        res.body.objects.should.have.length(2);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < res.body.objects.length; i++) {
          res.body.objects[i].should.have.property('type');
          res.body.objects[i].should.have.property('id');
          res.body.objects[i].should.have.property('created_by_ref');
          res.body.objects[i].should.have.property('created');
          res.body.objects[i].should.have.property('modified');
          res.body.objects[i].should.have.property('name');
          res.body.objects[i].should.have.property('description');
          res.body.objects[i].should.have.property('external_references');
        }
        done();
      })
  })
  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects using pagination with an invalid range of integers', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .set('range', 'items=70-60')
      .end((err, res) => {
        res.should.have.status(416);
        done();
      })
  })
  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects using pagination with invalid syntax in the range header (error 416)', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .set('range', 'foo=-20-xyz')
      .end((err, res) => {
        res.should.have.status(416);
        done();
      })
  })
  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with an invalid content type (error 406)', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects')
      .set('range', 'items=20-30')
      .end((err, res) => {
        res.should.have.status(406);
        done();
      })
  })
  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with ID course-of-action--4f170666-7edb-4489-85c2-9affa28a72e0', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects?match[id]=course-of-action--4f170666-7edb-4489-85c2-9affa28a72e0')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('type', 'bundle');
        res.body.should.have.property('id');
        res.body.should.have.property('spec_version', config.bundle_spec_version);
        res.body.should.have.property('objects');
        res.body.objects.should.have.length(1);
        res.body.objects[0].should.have.property('id', 'course-of-action--4f170666-7edb-4489-85c2-9affa28a72e0');
        done();
      })
  })
  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with IDs course-of-action--4f170666-7edb-4489-85c2-9affa28a72e0, attack-pattern--dcaa092b-7de9-4a21-977f-7fcb77e89c48', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects?match[id]=course-of-action--4f170666-7edb-4489-85c2-9affa28a72e0,attack-pattern--dcaa092b-7de9-4a21-977f-7fcb77e89c48')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('type', 'bundle');
        res.body.should.have.property('id');
        res.body.should.have.property('spec_version', config.bundle_spec_version);
        res.body.should.have.property('objects');
        res.body.objects.should.have.length(2);
        res.body.objects[0].should.have.property('id', 'course-of-action--4f170666-7edb-4489-85c2-9affa28a72e0');
        res.body.objects[1].should.have.property('id', 'attack-pattern--dcaa092b-7de9-4a21-977f-7fcb77e89c48');
        done();
      })
  })
  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with IDs invalid, attack-pattern--dcaa092b-7de9-4a21-977f-7fcb77e89c48', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects?match[id]=invalid,attack-pattern--dcaa092b-7de9-4a21-977f-7fcb77e89c48')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('type', 'bundle');
        res.body.should.have.property('id');
        res.body.should.have.property('spec_version', config.bundle_spec_version);
        res.body.should.have.property('objects');
        res.body.objects.should.have.length(1);
        res.body.objects[0].should.have.property('id', 'attack-pattern--dcaa092b-7de9-4a21-977f-7fcb77e89c48');
        done();
      })
  })
  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with IDs invalid, foo (error 416)', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects?match[id]=invalid,foo')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(416);
        done();
      })
  })
  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with type attack-pattern', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects?match[type]=attack-pattern')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('type', 'bundle');
        res.body.should.have.property('id');
        res.body.should.have.property('spec_version', config.bundle_spec_version);
        res.body.should.have.property('objects');
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < res.body.objects.length; i += 1) {
          res.body.objects[i].should.have.property('type', 'attack-pattern');
        }
        done();
      })
  })
  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with types attack-pattern, course-of-action', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects?match[type]=attack-pattern,course-of-action')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('type', 'bundle');
        res.body.should.have.property('id');
        res.body.should.have.property('spec_version', config.bundle_spec_version);
        res.body.should.have.property('objects');
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < res.body.objects.length; i += 1) {
          if (res.body.objects[i].type === 'attack-pattern') {
            res.body.objects[i].should.have.property('type', 'attack-pattern');
          } else if (res.body.objects[i].type === 'course-of-action') {
            res.body.objects[i].should.have.property('type', 'course-of-action');
          } else {
            // trigger error
            res.body.objects[i].should.have.property('type', 'attack-pattern');
            res.body.objects[i].should.have.property('type', 'course-of-action');
          }
        }
        done();
      })
  })
  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with types invalid, course-of-action', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects?match[type]=invalid,course-of-action')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('type', 'bundle');
        res.body.should.have.property('id');
        res.body.should.have.property('spec_version', config.bundle_spec_version);
        res.body.should.have.property('objects');
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < res.body.objects.length; i += 1) {
            res.body.objects[i].should.have.property('type', 'course-of-action');
        }
        done();
      })
  })
  // it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with types invalid, foo (error 416)', (done) => {
  //   chai.request(server)
  //     .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects?match[type]=invalid,foo')
  //     .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
  //     .end((err, res) => {
  //       res.should.have.status(416);
  //       done();
  //     })
  // })
  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with any version', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects?match[version]=all')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('type', 'bundle');
        res.body.should.have.property('id');
        res.body.should.have.property('spec_version', config.bundle_spec_version);
        res.body.should.have.property('objects');
        res.body.objects.should.have.length(52);
        done();
      })
  })
//   it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with the latest version', (done) => {
//     chai.request(server)
//       .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects?match[version]=last')
//       .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
//       .end((err, res) => {
//         res.should.have.status(200);
//         res.body.should.have.property('type', 'bundle');
//         res.body.should.have.property('id');
//         res.body.should.have.property('spec_version', config.bundle_spec_version);
//         res.body.should.have.property('objects');
//         const isValid = validateLastVersionFilter(res.body.objects);
//         expect(isValid).to.be.equal(true);
//         done();
//       })
//   })
//   it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with the first version', (done) => {
//     chai.request(server)
//       .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects?match[version]=first')
//       .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
//       .end((err, res) => {
//         res.should.have.status(200);
//         res.body.should.have.property('type', 'bundle');
//         res.body.should.have.property('id');
//         res.body.should.have.property('spec_version', config.bundle_spec_version);
//         res.body.should.have.property('objects');
//         const isValid = validateFirstVersionFilter(res.body.objects);
//         expect(isValid).to.be.equal(true);
//         done();
//       })
//   })
  // it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with version 2017-12-14T16:55:59.600Z', (done) => {
  //   chai.request(server)
  //     .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects?match[version]=2017-12-14T16:55:59.600Z')
  //     .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
  //     .end((err, res) => {
  //       res.should.have.status(200);
  //       res.body.should.have.property('type', 'bundle');
  //       res.body.should.have.property('id');
  //       res.body.should.have.property('spec_version', config.bundle_spec_version);
  //       res.body.should.have.property('objects');
  //       // tslint:disable-next-line:prefer-for-of
  //       for (let i = 0; i < res.body.objects.length; i += 1) {
  //         res.body.objects[i].should.have.property('modified', '2017-12-14T16:55:59.600Z');
  //       }
  //       done();
  //     })
  // })
  // it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with versions 2017-12-14T16:55:59.600Z, 2017-12-15T16:55:59.600Z', (done) => {
  //   chai.request(server)
  //     .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects?match[version]=2017-12-14T16:55:59.600Z,2017-12-15T16:55:59.600Z')
  //     .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
  //     .set('range', 'items=2-52')
  //     .end((err, res) => {
  //       res.should.have.status(206);
  //       res.body.should.have.property('type', 'bundle');
  //       res.body.should.have.property('id');
  //       res.body.should.have.property('spec_version', config.bundle_spec_version);
  //       res.body.should.have.property('objects');
  //       for (let i = 0; i < res.body.objects.length; i += 1) {
  //         if (i < 48) {
  //           res.body.objects[i].should.have.property('modified', '2017-12-14T16:55:59.600Z');
  //         } else {
  //           res.body.objects[i].should.have.property('modified', '2017-12-15T16:55:59.600Z');
  //         }
  //       }
  //       done();
  //     })
  // })
  // it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with version foo (error 416)', (done) => {
  //   chai.request(server)
  //     .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects?match[version]=foo')
  //     .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
  //     .end((err, res) => {
  //       res.should.have.status(416);
  //       done();
  //     })
  // })
  it('it should GET objects from /undefined/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects (error 404)', (done) => {
    chai.request(server)
      .get('/undefined/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
  })
  it('it should GET objects from /stix/collections/undefined/objects (error 404)', (done) => {
    chai.request(server)
      .get('/stix/collections/undefined/objects')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
  })
  it('it should GET objects from /undefined/collections/undefined/objects (error 404)', (done) => {
    chai.request(server)
      .get('/undefined/collections/undefined/objects')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
  });

  // ~~~ Post-June 2018 Unit Tests ~~~

  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with X-TAXII-Date-Added-First', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .set('X-TAXII-Date-Added-First', '2017-06-01T00:00:00.000Z')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.have.header('content-type', 'application/vnd.oasis.stix+json; charset=utf-8; version=2.0');
        res.should.be.a('object');
        res.body.should.have.property('type', 'bundle');
        res.body.should.have.property('id');
        res.body.should.have.property('spec_version', config.bundle_spec_version);
        res.body.should.have.property('objects');
        res.body.objects.should.have.length(32);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < res.body.objects.length; i++) {
          res.body.objects[i].should.have.property('type');
          res.body.objects[i].should.have.property('id');
          res.body.objects[i].should.have.property('created_by_ref');
          res.body.objects[i].should.have.property('created');
          res.body.objects[i].should.have.property('modified');
          res.body.objects[i].should.have.property('name');
          res.body.objects[i].should.have.property('description');
          res.body.objects[i].should.have.property('external_references');
        }
        done();
      })
  });
  
  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with X-TAXII-Date-Added-Last', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .set('X-TAXII-Date-Added-Last', '2017-06-01T00:00:00.000Z')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.have.header('content-type', 'application/vnd.oasis.stix+json; charset=utf-8; version=2.0');
        res.should.be.a('object');
        res.body.should.have.property('type', 'bundle');
        res.body.should.have.property('id');
        res.body.should.have.property('spec_version', config.bundle_spec_version);
        res.body.should.have.property('objects');
        res.body.objects.should.have.length(20);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < res.body.objects.length; i++) {
          res.body.objects[i].should.have.property('type');
          res.body.objects[i].should.have.property('id');
          res.body.objects[i].should.have.property('created_by_ref');
          res.body.objects[i].should.have.property('created');
          res.body.objects[i].should.have.property('modified');
          res.body.objects[i].should.have.property('name');
          res.body.objects[i].should.have.property('description');
          res.body.objects[i].should.have.property('external_references');
        }
        done();
      })
  });

  it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with date ranges', (done) => {
    chai.request(server)
      .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects')
      .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
      .set('X-TAXII-Date-Added-First', '2017-05-31T21:31:27.985Z')
      .set('X-TAXII-Date-Added-Last', '2017-12-14T16:46:06.044Z')
      .end((err, res) => {
        console.log(res.body.objects.length);
        res.should.have.status(200);
        res.should.have.header('content-type', 'application/vnd.oasis.stix+json; charset=utf-8; version=2.0');
        res.should.be.a('object');
        res.body.should.have.property('type', 'bundle');
        res.body.should.have.property('id');
        res.body.should.have.property('spec_version', config.bundle_spec_version);
        res.body.should.have.property('objects');
        res.body.objects.should.have.length(9);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < res.body.objects.length; i++) {
          res.body.objects[i].should.have.property('type');
          res.body.objects[i].should.have.property('id');
          res.body.objects[i].should.have.property('created_by_ref');
          res.body.objects[i].should.have.property('created');
          res.body.objects[i].should.have.property('modified');
          res.body.objects[i].should.have.property('name');
          res.body.objects[i].should.have.property('description');
          res.body.objects[i].should.have.property('external_references');
        }
        done();
      })
  });
});
