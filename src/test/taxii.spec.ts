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

describe('/GET taxii', () => {
  it('it should GET server discovery info', (done: any) => {
    chai.request(server)
      .get('/taxii')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.0')
      .end((err: any, res: any) => {
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
  it('it should GET server discovery info with an invalid content type (error 406)', (done: any) => {
    chai.request(server)
      .get('/taxii')
      .set('accept', 'application/vnd.oasis.taxii+json; version=2.1')
      .end((err: any, res: any) => {
        res.should.have.status(406);
        done();
      })
  });
});
