import * as express from 'express';

import mongoose from './init';
import * as spdy from 'spdy';
import error from '../errors/http-error';
import * as fs from 'fs';
import TaxiiController from '../controllers/taxii-controller';

import * as _config from '../assets/config.json';
import * as _collections from '../assets/collections.json';
import * as testConfig from '../test/config.json';

let config: any;
let collections: any = _collections;
if (process.env.NODE_ENV === 'test') {
  config = testConfig;
} else {
  config = _config;
}

const app = express();

mongoose.connect(config.connection_string);

app.disable('x-powered-by');

const validRoots: any[] = [];
const rootKeys: any = Object.keys(config.discovery.api_roots);
const rootValues: any = Object.values(config.discovery.api_roots);
validRoots.push(config.discovery.default.split('/').pop());

for (let i = 0; i < rootKeys.length; i += 1) {
  validRoots.push(rootValues[i].split('/').pop());
}

app.use('/', TaxiiController);

app.use((err: any, req: express.Request, res: express.Response, next: any) => {
  if (err) {
    res.status(500).send(error.ERROR_500);
    next(err);
  }
});

// ~~~ http2 Server ~~~

const server = spdy.createServer({
  key: fs.readFileSync('/etc/pki/tls/certs/server.key'),
  cert: fs.readFileSync('/etc/pki/tls/certs/server.crt')
}, app);

server.on('error', (errorObj: any) => {
  if (errorObj.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof config.port === 'string'
    ? 'Pipe ' + config.port
    : 'Port ' + config.port;

  // handle specific listen errors with friendly messages
  switch (errorObj.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});

server.on('listening', () => console.log(`TAXII 2.0 server listening on port ${server.address().port}`));

server.listen(config.port);

module.exports = app;
