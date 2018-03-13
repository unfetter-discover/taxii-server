const express = require('express');
const uuidv4 = require('uuid/v4');

const mongoose = require('./init');
const error = require('./errors/http-error');
const helper = require('./helper');
const collections = require('./collections');

const objectSchema = require('./models/object');

const app = express();

let config = require('./config');
const testConfig = require('./test/config');

if (process.env.NODE_ENV === 'test') {
  config = testConfig;
}

mongoose.connect(config.connection_string);

app.disable('x-powered-by');

const validRoots = [];
const rootKeys = Object.keys(config.discovery.api_roots);
const rootValues = Object.values(config.discovery.api_roots);
validRoots.push(config.discovery.default.split('/').pop());
for (let i = 0; i < rootKeys.length; i += 1) {
  validRoots.push(rootValues[i].split('/').pop());
}

app.get('/taxii', (req, res) => {
  res.removeHeader('Accept-Ranges');
  res.removeHeader('Content-Range');
  if (helper.isValidContentType(req, 'taxii')) {
    const discovery = helper.cloneObject(Object.getOwnPropertyDescriptor(config, 'discovery'));
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
  if (helper.isValidContentType(req, 'taxii')) {
    let response;
    if (config.autogenerate_roots.enabled) {
      response = {};
      if (helper.arrayContains(req.params.root, validRoots)) {
        response.title = req.params.root;
        response.max_content_length = config.autogenerate_roots.max_content_length;
        response.versions = config.autogenerate_roots.versions;
      } else {
        response = null;
      }
    } else {
      const roots = Object.getOwnPropertyDescriptor(config, 'roots');
      for (let i = 0; i < roots.value.length; i += 1) {
        if (roots.value[i].path === req.params.root) {
          response = helper.cloneObject(roots.value[i]);
          delete response.path;
        }
      }
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

  if (helper.isValidContentType(req, 'taxii')) {
    if (req.get('range')) {
      if (req.get('range').indexOf('items') !== 0) {
        res.status(416).send(error.ERROR_416);
        return;
      }

      const regExp = /\=(.*)\-/;
      let firstElement = regExp.exec(req.get('range'));
      let lastElement = req.get('range').substring(req.get('range').indexOf('-') + 1);

      if(firstElement == null) {
        res.status(416).send(error.ERROR_416);
        return;
      } else {
        firstElement = firstElement[0].substring(1, firstElement[0].length - 1);
        lastElement = parseInt(lastElement, 10) + 1;
        if (isNaN(lastElement)) {
          rootCollections = rootCollections.slice(firstElement);
        }
        else {
          rootCollections = rootCollections.slice(firstElement, lastElement);
        }
        res.status(206);
      }
    }

    for (let i = 0; i < rootCollections.length; i += 1) {
      rootCollections[i].can_read = 'true';
      rootCollections[i].can_write = 'false';
      rootCollections[i].media_types = ['application/vnd.oasis.stix+json; version=2.0'];
    }

    if (rootCollections && rootCollections.length) {
      res.set('Content-Type', config.response_type.taxii);
      res.send(rootCollections);
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

  for (let i = 0; i < rootCollections.length; i += 1) {
    if (req.params.id === rootCollections[i].id) {
      isCollectionValid = true;
    }
  }

  if (!isCollectionValid) {
    res.status(404).send(error.ERROR_404);
  }

  if (helper.isValidContentType(req, 'taxii')) {
    for (let i = 0; i < rootCollections.length; i += 1) {
      if (rootCollections[i].id === req.params.id) {
        match = rootCollections[i];
        // these are hardcoded for response until write access is implemented
        match.can_read = 'true';
        match.can_write = 'false';
        match.media_types = ['application/vnd.oasis.stix+json; version=2.0'];
      }
    }
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

  if (helper.isValidContentType(req, 'stix')) {
    let obj;

    if (Object.prototype.hasOwnProperty.call(mongoose, `${req.params.root}_conn`)) {
      obj = mongoose[`${req.params.root}_conn`].model('Objects', objectSchema, 'stix');
    } else {
      res.status(404).send(error.ERROR_404);
      return;
    }

    obj.find({ 'metaProperties.collection': req.params.id }, (err, data) => {
      res.set('Content-Type', config.response_type.stix);
      if (data && data.length) {
        let responseData = data;

        if (req.query.match) {
          if (req.query.match.id) {
            responseData = helper.filterId(req.query.match.id, JSON.parse(JSON.stringify(data)));
          }

          if (req.query.match.type) {
            responseData = helper.filterType(
              req.query.match.type,
              JSON.parse(JSON.stringify(data)),
            );
          }

          if (req.query.match.version) {
            responseData = helper.filterVersion(
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
          let firstElement = regExp.exec(req.get('range'));
          let lastElement = req.get('range').substring(req.get('range').indexOf('-') + 1);

          if(firstElement == null) {
            res.status(416).send(error.ERROR_416);
            return;
          } else {
            firstElement = firstElement[0].substring(1, firstElement[0].length - 1);
            lastElement = parseInt(lastElement, 10) + 1;
            if (isNaN(lastElement)) {
              responseData = responseData.slice(firstElement);
            }
            else {
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
            id: uuidv4(),
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
  if (helper.isValidContentType(req, 'stix')) {
    let objects;

    if (Object.prototype.hasOwnProperty.call(mongoose, `${req.params.root}_conn`)) {
      objects = mongoose[`${req.params.root}_conn`].model('Objects', objectSchema, 'stix');
    } else {
      res.status(404).send(error.ERROR_404);
      return;
    }

    objects.find({ 'metaProperties.collection': req.params.id, 'stix.id': req.params.objectid }, (err, data) => {
      res.set('Content-Type', config.response_type.stix);
      let responseData = JSON.parse(JSON.stringify(data));
      if (req.query.match) {
        if (req.query.match.version) {
          responseData = helper.filterVersion(
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
          id: uuidv4(),
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
  if (helper.isValidContentType(req, 'taxii')) {
    let objects;

    if (Object.prototype.hasOwnProperty.call(mongoose, `${req.params.root}_conn`)) {
      objects = mongoose[`${req.params.root}_conn`].model('Objects', objectSchema, 'stix');
    } else {
      res.status(404).send(error.ERROR_404);
      return;
    }

    objects.find({ 'metaProperties.collection': req.params.id }, '-_id', (err, data) => {
      res.set('Content-Type', config.response_type.taxii);

      let responseData = JSON.parse(JSON.stringify(data));

      if (!responseData.length) {
        res.status(404).send(JSON.stringify(error.ERROR_404));
        return;
      }

      if (req.query.match) {
        if (req.query.match.id) {
          responseData = helper.filterId(req.query.match.id, JSON.parse(JSON.stringify(responseData)));
        }

        if (req.query.match.type) {
          responseData = helper.filterType(
            req.query.match.type,
            JSON.parse(JSON.stringify(responseData)),
          );
        }

        if (req.query.match.version) {
          responseData = helper.filterVersion(
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
        let firstElement = regExp.exec(req.get('range'));
        let lastElement = req.get('range').substring(req.get('range').indexOf('-') + 1);

        if(firstElement == null) {
          res.status(416).send(error.ERROR_416);
          return;
        } else {
          firstElement = firstElement[0].substring(1, firstElement[0].length - 1);
          lastElement = parseInt(lastElement, 10) + 1;
          if (isNaN(lastElement)) {
            responseData = responseData.slice(firstElement);
          }
          else {
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

app.use((err, req, res, next) => {
  if (err) {
    res.status(500).send(error.ERROR_500);
    next(err);
  }
});

module.exports = app;
