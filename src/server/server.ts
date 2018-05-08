import * as express from 'express';

import * as spdy from 'spdy';
import error from '../errors/http-error';
import * as fs from 'fs';
import TaxiiController from '../controllers/taxii-controller';
import config from '../services/config.service';

import * as _collections from '../assets/collections.json';
import mongoInit from './mongoinit';

let collections: any = _collections;

const app = express();

app.disable('x-powered-by');

const validRoots: any[] = [];
const rootKeys: any = Object.keys(config.discovery.api_roots);
const rootValues: any = Object.values(config.discovery.api_roots);
validRoots.push(config.discovery.default.split('/').pop());

for (let i = 0; i < rootKeys.length; i += 1) {
  validRoots.push(rootValues[i].split('/').pop());
}

// Verify certificate
if (config.ssl && process.env.NODE_ENV !== 'test') {
  app.use((req: express.Request | any, res: express.Response, next: express.NextFunction) => {
    // Cert is not present
    if (!req.client.authorized) {
      return res.status(401).send('User is not authorized');
    }
    next();
  });
}

app.use('/', TaxiiController);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err) {
    res.status(500).send(error.ERROR_500);
    next(err);
  }
});

/**
 * @description Start http2 server after connected to mongodb
 */
async function startServer() {
  try {
    const dbConnMsg = await mongoInit(config.connection_string);

    let serverOptions: object;

    if (config.ssl) {
      serverOptions = {
        key: fs.readFileSync(config.ssl.keyPath),
        cert: fs.readFileSync(config.ssl.certPath),
        ca: fs.readFileSync(config.ssl.caPath),
        requestCert: true,
        rejectUnauthorized: false
      };
    } else {
      serverOptions = {
        key: fs.readFileSync('/etc/pki/tls/certs/server.key'),
        cert: fs.readFileSync('/etc/pki/tls/certs/server.crt')
      };
    }

    global.server = spdy.createServer(serverOptions, app);

    global.server.on('error', (errorObj: any) => {
      if (errorObj.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof config.express_port === 'string'
        ? 'Pipe ' + config.express_port
        : 'Port ' + config.express_port;

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

    global.server.on('listening', () => console.log(`TAXII 2.0 server listening on port ${global.server.address().port}`));

    global.server.listen(config.express_port);
  } catch (error) {
    console.log('Error: ', error);
  }
}

startServer();

module.exports = app;
