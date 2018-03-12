/* eslint-disable */
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('./config');
const server = require('../server');

const should = chai.should();
const expect = chai.expect;

chai.use(chaiHttp);

describe('TAXII', () => {
  describe('/GET taxii', () => {
    it('it should GET server discovery info', (done) => {
      chai.request(server)
        .get('/taxii')
        .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.have.header('content-type', 'application/vnd.oasis.taxii+json; charset=utf-8; version=2.0');
          res.should.be.a('object');
          res.body.should.have.property('title', config.discovery.title);
          res.body.should.have.property('description', config.discovery.description);
          res.body.should.have.property('contact', config.discovery.contact);
          res.body.should.have.property('default');
          res.body.should.have.property('api_roots');
          done();
        });
    });
    it('it should GET server discovery info with an invalid content type (error 406)', (done) => {
      chai.request(server)
        .get('/taxii')
        .set('accept', 'application/vnd.oasis.taxii+json; version=2.1')
        .end((err, res) => {
          res.should.have.status(406);
          done();
        })
    });
  });
  describe('/GET :root', () => {
    config.autogenerate_roots = 0;
    it('it should GET /stix API root info (manually defined)', (done) => {
      chai.request(server)
        .get('/stix')
        .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
        .end((err, res) => {
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
        .end((err, res) => {
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
        .end((err, res) => {
          res.should.have.status(404);
          done();
        })
    })
  });
  describe('/GET :root/collections', () => {
    it('it should GET /stix collections info', (done) => {
      chai.request(server)
        .get('/stix/collections')
        .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
        .end((err, res) => {
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
        .end((err, res) => {
          res.should.have.status(206);
          res.should.have.header('content-type', 'application/vnd.oasis.taxii+json; charset=utf-8; version=2.0');
          res.should.be.a('object');
          res.body.should.have.length(1);
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
        .end((err, res) => {
          res.should.have.status(416);
          done();
        })
    })
    it('it should GET /stix collections info using pagination with invalid syntax in the range header (error 500)', (done) => {
      chai.request(server)
        .get('/stix/collections')
        .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
        .set('range', 'foo=-20-xyz')
        .end((err, res) => {
          res.should.have.status(500);
          done();
        })
    })
    it('it should GET /stix collections info with an invalid content type (error 406)', (done) => {
      chai.request(server)
        .get('/stix/collections')
        .set('range', 'items=20-30')
        .end((err, res) => {
          res.should.have.status(406);
          done();
        })
    })
    it('it should GET /undefined collections info (error 404)', (done) => {
      chai.request(server)
        .get('/undefined/collections')
        .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        })
    })
  });
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
          res.body.should.have.property("can_read", "true");
          res.body.should.have.property("can_write", "false");
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
          res.should.have.status(206);
          res.should.have.header('content-type', 'application/vnd.oasis.stix+json; charset=utf-8; version=2.0');
          res.should.be.a('object');
          res.body.should.have.property('type', 'bundle');
          res.body.should.have.property('id');
          res.body.should.have.property('spec_version', config.bundle_spec_version);
          res.body.should.have.property('objects');
          res.body.objects.should.have.length(2);
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
        .set('range', 'items=60-70')
        .end((err, res) => {
          res.should.have.status(416);
          done();
        })
    })
    it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects using pagination with invalid syntax in the range header (error 500)', (done) => {
      chai.request(server)
        .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects')
        .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
        .set('range', 'foo=-20-xyz')
        .end((err, res) => {
          res.should.have.status(500);
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
          for (let i = 0; i < res.body.objects.length; i += 1) {
              res.body.objects[i].should.have.property('type', 'course-of-action');
          }
          done();
        })
    })
    it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with types invalid, foo (error 416)', (done) => {
      chai.request(server)
        .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects?match[type]=invalid,foo')
        .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
        .end((err, res) => {
          res.should.have.status(416);
          done();
        })
    })
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
    it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with the latest version', (done) => {
      chai.request(server)
        .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects?match[version]=last')
        .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('type', 'bundle');
          res.body.should.have.property('id');
          res.body.should.have.property('spec_version', config.bundle_spec_version);
          res.body.should.have.property('objects');
          const isValid = validateLastVersionFilter(res.body.objects);
          expect(isValid).to.be.equal(true);
          done();
        })
    })
    it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with the first version', (done) => {
      chai.request(server)
        .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects?match[version]=first')
        .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('type', 'bundle');
          res.body.should.have.property('id');
          res.body.should.have.property('spec_version', config.bundle_spec_version);
          res.body.should.have.property('objects');
          const isValid = validateFirstVersionFilter(res.body.objects);
          expect(isValid).to.be.equal(true);
          done();
        })
    })
    it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with version 2017-12-14T16:55:59.600Z', (done) => {
      chai.request(server)
        .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects?match[version]=2017-12-14T16:55:59.600Z')
        .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('type', 'bundle');
          res.body.should.have.property('id');
          res.body.should.have.property('spec_version', config.bundle_spec_version);
          res.body.should.have.property('objects');
          for (let i = 0; i < res.body.objects.length; i += 1) {
            res.body.objects[i].should.have.property('modified', '2017-12-14T16:55:59.600Z');
          }
          done();
        })
    })
    it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with versions 2017-12-14T16:55:59.600Z, 2017-12-15T16:55:59.600Z', (done) => {
      chai.request(server)
        .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects?match[version]=2017-12-14T16:55:59.600Z,2017-12-15T16:55:59.600Z')
        .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
        .set('range', 'items=2-52')
        .end((err, res) => {
          res.should.have.status(206);
          res.body.should.have.property('type', 'bundle');
          res.body.should.have.property('id');
          res.body.should.have.property('spec_version', config.bundle_spec_version);
          res.body.should.have.property('objects');
          for (let i = 0; i < res.body.objects.length; i += 1) {
            if (i < 48) {
              res.body.objects[i].should.have.property('modified', '2017-12-14T16:55:59.600Z');
            } else {
              res.body.objects[i].should.have.property('modified', '2017-12-15T16:55:59.600Z');
            }
          }
          done();
        })
    })
    it('it should GET objects from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects with version foo (error 416)', (done) => {
      chai.request(server)
        .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects?match[version]=foo')
        .set('accept', 'application/vnd.oasis.stix+json; version=2.0')
        .end((err, res) => {
          res.should.have.status(416);
          done();
        })
    })
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
    })
  })
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
  describe('/GET :root/collections/:id/manifest', () => {
    it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest', (done) => {
      chai.request(server)
        .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest')
        .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.have.header('content-type', 'application/vnd.oasis.taxii+json; charset=utf-8; version=2.0');
          res.should.be.a('object');
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
    it('it should GET manifest from /stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest using pagination with invalid syntax in the range header (error 500)', (done) => {
      chai.request(server)
        .get('/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/manifest')
        .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
        .set('range', 'foo=-20-xyz')
        .end((err, res) => {
          res.should.have.status(500);
          done();
        })
    })
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
          for (let i = 0; i < res.body.length; i += 1) {
            res.body[i].should.have.property('id');
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
          for (let i = 0; i < res.body.length; i += 1) {
            res.body[i].should.have.property('id');
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
          for (let i = 0; i < res.body.length; i += 1) {
            res.body[i].should.have.property('id');
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
          for (let i = 0; i < res.body.length; i += 1) {
            if (res.body[i].versions[0] !== '2017-12-14T16:55:59.600Z') {
              let isValid = false;
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
          for (let i = 0; i < res.body.length; i += 1) {
            if (res.body[i].versions[0] !== '2017-12-14T16:55:59.600Z' && res.body[i].versions[0] !== '2017-12-15T16:55:59.600Z') {
              let isValid = false;
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
});

const validateLastVersionFilter = (data) => {
  for (let i = 1; i < data.length; i += 1) {
    if(data[i].modified) {
      if ((Date(data[i].modified) < Date(data[i-1].modified)) || (data[i].id === data[i - 1].id)) {
        return false;
      }
    }
  }
  return true;
}

const validateFirstVersionFilter = (data) => {
  for (let i = 1; i < data.length; i += 1) {
    if (data[i].modified) {
      if ((Date(data[i].modified) > Date(data[i-1].modified)) || (data[i].id === data[i - 1].id)) {
        return false;
      }
    } 
  }
  return true;
}