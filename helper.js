const config = require('./config');

const isValidContentType = (req, type) => {
  const accepts = Object.getOwnPropertyDescriptor(config, 'accepts');
  if (type === 'taxii') {
    for (let i = 0; i < accepts.value.length; i += 1) {
      if (req.headers.accept === accepts.value[i] && accepts.value[i].indexOf('taxii') !== -1) {
        return 1;
      }
    }
  } else if (type === 'stix') {
    for (let i = 0; i < accepts.value.length; i += 1) {
      if (req.headers.accept === accepts.value[i] && accepts.value[i].indexOf('stix') !== -1) {
        return 1;
      }
    }
  }
  return 0;
};

const cloneObject = (obj) => {
  const clone = JSON.parse(JSON.stringify(obj));
  return clone;
};

const arrayContains = (str, arr) => {
  const contains = (arr.indexOf(str) > -1);
  return (contains);
};

const remove = (element, arr) => {
  const filter = arr.filter(e => e !== element);
  return filter;
};

const filterId = (id, data) => {
  const responseData = [];
  if (id.indexOf(',') > -1) {
    const splitIds = id.split(',');
    for (let i = 0; i < splitIds.length; i += 1) {
      for (let j = 0; j < data.length; j += 1) {
        if (splitIds[i] === data[j].stix.id) {
          responseData.push(data[j].stix);
        }
      }
    }
  } else if (id) {
    for (let i = 0; i < data.length; i += 1) {
      if (data[i].stix.id === id) {
        responseData.push(data[i].stix);
      }
    }
  }
  return responseData;
};

const filterType = (type, data) => {
  const responseData = [];
  if (type.indexOf(',') > -1) {
    const splitTypes = type.split(',');
    for (let i = 0; i < splitTypes.length; i += 1) {
      for (let j = 0; j < data.length; j += 1) {
        if (splitTypes[i] === data[j].stix.type) {
          responseData.push(data[j].stix);
        }
      }
    }
  } else if (type) {
    for (let i = 0; i < data.length; i += 1) {
      if (data[i].stix.type === type) {
        responseData.push(data[i].stix);
      }
    }
  }
  return responseData;
};

const filterVersion = (version, data) => {
  let responseData = data;

  if (version === 'last') {
    responseData.sort((a, b) => {
      const dateA = new Date(a.stix.modified);
      const dateB = new Date(b.stix.modified);

      if (dateA > dateB) {
        return -1;
      } else if (dateA < dateB) {
        return 1;
      }
      return 0;
    });

    const filteredData = [];
    const uniqueIds = [];
    for (let i = 0; i < responseData.length; i += 1) {
      if (i === 0) {
        filteredData.push(responseData[i]);
        uniqueIds.push(responseData[i].stix.id);
      } else if (uniqueIds.indexOf(responseData[i].stix.modified) === -1) {
        filteredData.push(responseData[i]);
      }
    }

    responseData = filteredData;
  } else if (version === 'first') {
    responseData.sort((a, b) => {
      const dateA = new Date(a.stix.modified);
      const dateB = new Date(b.stix.modified);

      if (dateA > dateB) {
        return -1;
      } else if (dateA < dateB) {
        return 1;
      }
      return 0;
    });

    const filteredData = [];
    const uniqueIds = [];

    for (let i = data.length - 1; i >= 0; i -= 1) {
      if (i === responseData.length - 1) {
        filteredData.push(responseData[i]);
        uniqueIds.push(responseData[i].stix.id);
      } else if (uniqueIds.indexOf(responseData[i].stix.modified) === -1) {
        filteredData.push(responseData[i]);
      }
    }

    responseData = filteredData;
  } else if (version !== 'all') {
    const filteredData = [];
    if (version.indexOf(',') > -1) {
      const splitVersions = version.split(',');
      for (let i = 0; i < splitVersions.length; i += 1) {
        for (let j = 0; j < responseData.length; j += 1) {
          if (splitVersions[i] === responseData[j].stix.modified) {
            filteredData.push(responseData[j].stix);
          }
        }
      }
    } else if (version) {
      for (let i = 0; i < responseData.length; i += 1) {
        if (responseData[i].stix.modified === version) {
          filteredData.push(responseData[i].stix);
        }
      }
    }
    responseData = filteredData;
  }

  return responseData;
};

const getMaxSize = (req) => {
  let maxSize;
  if (config.autogenerate_roots.enabled) {
    maxSize = config.autogenerate_roots.max_content_length;
  } else {
    const roots = Object.getOwnPropertyDescriptor(config, 'roots');
    for (let i = 0; i < roots.length; i += 1) {
      if (roots[i].path === req.params.root) {
        maxSize = roots[i].max_content_length;
      }
    }
  }
  return maxSize;
};

module.exports = {
  isValidContentType,
  cloneObject,
  arrayContains,
  remove,
  filterId,
  filterType,
  filterVersion,
  getMaxSize,
};
