import * as express from 'express';
import * as uuidv4 from 'uuid/v4';

import mongoose from './init';
import error from '../errors/http-error';
import Helper from './helper';
import * as objectSchema from '../models/object';

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

app.get('/taxii', (req: express.Request, res: express.Response) => {
  res.removeHeader('Accept-Ranges');
  res.removeHeader('Content-Range');
  if (Helper.isValidContentType(req, 'taxii')) {
    const discovery = { ...Object.getOwnPropertyDescriptor(config, 'discovery') };
    if (discovery) {
      res.set('Content-Type', config.response_type.taxii);
      discovery.value.default = `${req.protocol}://${req.get('host')}/${discovery.value.default}`;
      for (let i = 0; i < rootKeys.length; i += 1) {
        discovery.value.api_roots[i] = `${req.protocol}://${req.get('host')}/${discovery.value.api_roots[i]}`;
      }
      res.send(discovery.value);
    } else {
      res.status(404).send(error.ERROR_404);
    }
  } else {
    res.status(406).send(error.ERROR_406);
  }
});

app.get('/:root', (req, res) => {
  res.removeHeader('Accept-Ranges');
  res.removeHeader('Content-Range');
  if (Helper.isValidContentType(req, 'taxii')) {
    let response: any;
    if (config.autogenerate_roots.enabled) {
      response = {};
      if (Helper.arrayContains(req.params.root, validRoots)) {
        response.title = req.params.root;
        response.max_content_length = config.autogenerate_roots.max_content_length;
        response.versions = config.autogenerate_roots.versions;
      } else {
        response = null;
      }
    } else {
      const roots = Object.getOwnPropertyDescriptor(config, 'roots');
      roots.value.forEach((rootValue: any) => {
        if (rootValue.path === req.params.root) {
          response = { ...rootValue };
          delete response.path;
        }
      });
    }
    if (response) {
      res.set('Content-Type', config.response_type.taxii);
      res.send(response);
    } else {
      res.status(404).send(error.ERROR_404);
    }
  } else {
    res.status(406).send(error.ERROR_406);
  }
});

app.get('/:root/collections', (req, res) => {
  if (collections[req.params.root] === undefined) {
    res.status(404).send(error.ERROR_404);
  }

  let rootCollections = collections[req.params.root].collections;

  if (Helper.isValidContentType(req, 'taxii')) {
    if (req.get('range')) {
      if (req.get('range').indexOf('items') !== 0) {
        res.status(416).send(error.ERROR_416);
        return;
      }

      const regExp = /\=(.*)\-/;
      let firstElement: any = regExp.exec(req.get('range'));
      let lastElement: any = req.get('range').substring(req.get('range').indexOf('-') + 1);

      if (firstElement == null) {
        res.status(416).send(error.ERROR_416);
        return;
      } else {
        firstElement = firstElement[0].substring(1, firstElement[0].length - 1);
        lastElement = parseInt(lastElement, 10) + 1;
        if (isNaN(lastElement)) {
          rootCollections = rootCollections.slice(firstElement);
        } else {
          rootCollections = rootCollections.slice(firstElement, lastElement);
        }
        res.status(206);
      }
    }

    rootCollections.forEach((rootCollection: any) => {
      rootCollection.can_read = 'true';
      rootCollection.can_write = 'false';
      rootCollection.media_types = ['application/vnd.oasis.stix+json; version=2.0'];
    });

    if (rootCollections && rootCollections.length) {
      res.set('Content-Type', config.response_type.taxii);
      res.send({ 'collections': rootCollections });
    } else {
      res.status(416).send(error.ERROR_416);
    }
  } else {
    res.status(406).send(error.ERROR_406);
  }
});

app.get('/:root/collections/:id', (req, res) => {
  res.removeHeader('Accept-Ranges');
  res.removeHeader('Content-Range');
  let match;

  if (collections[req.params.root] === undefined) {
    res.status(404).send(error.ERROR_404);
  }

  const rootCollections = collections[req.params.root].collections;
  let isCollectionValid;

  rootCollections.forEach((rootCollection: any) => {
    if (req.params.id === rootCollection.id) {
      isCollectionValid = true;
    }
  });

  if (!isCollectionValid) {
    res.status(404).send(error.ERROR_404);
  }

  if (Helper.isValidContentType(req, 'taxii')) {
    rootCollections.forEach((rootCollection: any) => {
      if (rootCollection.id === req.params.id) {
        match = rootCollection;
        // these are hardcoded for response until write access is implemented
        match.can_read = 'true';
        match.can_write = 'false';
        match.media_types = ['application/vnd.oasis.stix+json; version=2.0'];
      }
    });
    if (match) {
      res.set('Content-Type', config.response_type.taxii);
      res.send(match);
    } else {
      res.status(416).send(error.ERROR_416);
    }
  } else {
    res.status(406).send(error.ERROR_406);
  }
});

app.get('/:root/collections/:id/objects', (req, res) => {
  res.set('Accept-Ranges', 'items');

  if (Helper.isValidContentType(req, 'stix')) {
    let obj;

    if (Object.prototype.hasOwnProperty.call(mongoose, `${req.params.root}_conn`)) {
      obj = mongoose[`${req.params.root}_conn`].model('Objects', objectSchema, 'stix');
    } else {
      res.status(404).send(error.ERROR_404);
      return;
    }

    obj.find({ 'metaProperties.collection': req.params.id }, (err: any, data: any) => {
      res.set('Content-Type', config.response_type.stix);
      if (data && data.length) {
        let responseData = data;

        if (req.query.match) {
          if (req.query.match.id) {
            responseData = Helper.filterId(req.query.match.id, JSON.parse(JSON.stringify(data)));
          }

          if (req.query.match.type) {
            responseData = Helper.filterType(
              req.query.match.type,
              JSON.parse(JSON.stringify(data)),
            );
          }

          if (req.query.match.version) {
            responseData = Helper.filterVersion(
              req.query.match.version,
              JSON.parse(JSON.stringify(data)),
            );
          }
        }

        for (let i = 0; i < responseData.length; i += 1) {
          responseData[i] = JSON.parse(JSON.stringify(responseData[i]));

          let extendedProperties = null;
          if (responseData[i].extendedProperties) {
            extendedProperties = responseData[i].extendedProperties;
          }

          if (responseData[i].stix) {
            responseData[i] = responseData[i].stix;
          }

          if (extendedProperties) {
            responseData[i] = Object.assign({}, responseData[i], extendedProperties);
          }
        }

        if (req.get('range')) {
          if (req.get('range').indexOf('items') !== 0) {
            res.status(416).send(error.ERROR_416);
            return;
          }

          const regExp = /\=(.*)\-/;
          let firstElement: any = regExp.exec(req.get('range'));
          let lastElement: any = req.get('range').substring(req.get('range').indexOf('-') + 1);

          if(firstElement == null) {
            res.status(416).send(error.ERROR_416);
            return;
          } else {
            firstElement = firstElement[0].substring(1, firstElement[0].length - 1);
            lastElement = parseInt(lastElement, 10) + 1;
            if (isNaN(lastElement)) {
              responseData = responseData.slice(firstElement);
            } else {
              responseData = responseData.slice(firstElement, lastElement);
            }
            res.status(206);
          }
        }

        if (responseData && responseData.length) {
          res.set('Content-Type', config.response_type.stix);
          // transform array to bundle
          const bundle = {
            type: 'bundle',
            id: 'bundle--' + uuidv4(),
            spec_version: config.bundle_spec_version,
            objects: responseData,
          };
          res.send(bundle);
        } else {
          // throws a json error if the string isn't wrapped in stringify()
          res.status(416).send(JSON.stringify(error.ERROR_416));
        }
      } else {
        // throws a json error if the string isn't wrapped in stringify()
        res.status(404).send(JSON.stringify(error.ERROR_404));
      }
    }).sort({'stix.created': -1});
  } else {
    res.status(406).send(error.ERROR_406);
  }
});

app.get('/:root/collections/:id/objects/:objectid', (req, res) => {
  res.removeHeader('Accept-Ranges');
  res.removeHeader('Content-Range');
  if (Helper.isValidContentType(req, 'stix')) {
    let objects;

    if (Object.prototype.hasOwnProperty.call(mongoose, `${req.params.root}_conn`)) {
      objects = mongoose[`${req.params.root}_conn`].model('Objects', objectSchema, 'stix');
    } else {
      res.status(404).send(error.ERROR_404);
      return;
    }

    objects.find({ 'metaProperties.collection': req.params.id, 'stix.id': req.params.objectid }, (err: any, data: any) => {
      res.set('Content-Type', config.response_type.stix);
      let responseData = JSON.parse(JSON.stringify(data));
      if (req.query.match) {
        if (req.query.match.version) {
          responseData = Helper.filterVersion(
            req.query.match.version,
            JSON.parse(JSON.stringify(data)),
          );
        }
      }

      for (let i = 0; i < responseData.length; i += 1) {
        responseData[i] = JSON.parse(JSON.stringify(responseData[i]));

        let extendedProperties = null;
        if (responseData[i].extendedProperties) {
          extendedProperties = responseData[i].extendedProperties;
        }

        if (responseData[i].stix) {
          responseData[i] = responseData[i].stix;
        }

        if (extendedProperties) {
          responseData[i] = Object.assign({}, responseData[i], extendedProperties);
        }
      }

      if (responseData.length) {
        const bundle = {
          type: 'bundle',
          id: 'bundle--' + uuidv4(),
          spec_version: config.bundle_spec_version,
          objects: responseData,
        };
        res.send(bundle);
      } else {
        res.status(404).send(JSON.stringify(error.ERROR_404));
      }
    });
  } else {
    res.status(406).send(error.ERROR_406);
  }
});

app.get('/:root/collections/:id/manifest', (req, res) => {
  if (Helper.isValidContentType(req, 'taxii')) {
    let objects;

    if (Object.prototype.hasOwnProperty.call(mongoose, `${req.params.root}_conn`)) {
      objects = mongoose[`${req.params.root}_conn`].model('Objects', objectSchema, 'stix');
    } else {
      res.status(404).send(error.ERROR_404);
      return;
    }

    objects.find({ 'metaProperties.collection': req.params.id }, '-_id', (err: any, data: any) => {
      res.set('Content-Type', config.response_type.taxii);

      let responseData = JSON.parse(JSON.stringify(data));

      if (!responseData.length) {
        res.status(404).send(JSON.stringify(error.ERROR_404));
        return;
      }

      if (req.query.match) {
        if (req.query.match.id) {
          responseData = Helper.filterId(req.query.match.id, JSON.parse(JSON.stringify(responseData)));
        }

        if (req.query.match.type) {
          responseData = Helper.filterType(
            req.query.match.type,
            JSON.parse(JSON.stringify(responseData)),
          );
        }

        if (req.query.match.version) {
          responseData = Helper.filterVersion(
            req.query.match.version,
            JSON.parse(JSON.stringify(responseData)),
          );
        }
      }

      if (req.get('range')) {
        if (req.get('range').indexOf('items') !== 0) {
          res.status(416).send(error.ERROR_416);
          return;
        }

        const regExp = /\=(.*)\-/;
        let firstElement: any = regExp.exec(req.get('range'));
        let lastElement: any = req.get('range').substring(req.get('range').indexOf('-') + 1);

        if(firstElement == null) {
          res.status(416).send(error.ERROR_416);
          return;
        } else {
          firstElement = firstElement[0].substring(1, firstElement[0].length - 1);
          lastElement = parseInt(lastElement, 10) + 1;
          if (isNaN(lastElement)) {
            responseData = responseData.slice(firstElement);
          } else {
            responseData = responseData.slice(firstElement, lastElement);
          }
          res.status(206);
        }
      }

      const manifest = [];
      let manifestEntry;
      for (let i = 0; i < responseData.length; i += 1) {
        if (responseData[i].stix) {
          responseData[i] = responseData[i].stix;
        }
        manifestEntry = {
          id: responseData[i].id,
          date_added: responseData[i].created,
          versions: [responseData[i].modified],
          media_types: config.response_type.stix,
        };
        manifest.push(manifestEntry);
      }

      responseData = manifest;

      if (responseData && responseData.length) {
        res.send(responseData);
      } else {
        // throws a json error if the string isn't wrapped in stringify()
        res.status(416).send(JSON.stringify(error.ERROR_416));
      }
    }).sort({'stix.created': -1});
  } else {
    // throws a json error if the string isn't wrapped in stringify()
    res.status(406).send(JSON.stringify(error.ERROR_406));
  }
});

app.listen(config.port, config.bind_address, () => {
  console.log(`TAXII 2.0 server listening on port ${config.port}`);
});

app.use((err: any, req: express.Request, res: express.Response, next: any) => {
  if (err) {
    res.status(500).send(error.ERROR_500);
    next(err);
  }
});

module.exports = app;
