import { Request } from 'express';

import * as config from '../assets/config.json';

export default class Helper {
  public static isValidContentType(req: Request, type: string): boolean {
    const accepts = Object.getOwnPropertyDescriptor(config, 'accepts');
    if (type === 'taxii' || type === 'stix') {
      for (let acceptValue of accepts.value) {
        if (req.headers.accept === acceptValue && acceptValue.indexOf(type) !== -1) {
          return true;
        }
      }
    }
    return false;
  }

  public static cloneObject(obj: any) {
    const clone = JSON.parse(JSON.stringify(obj));
    return clone;
  }

  public static arrayContains(str: any, arr: any[]) {
    const contains = (arr.indexOf(str) > -1);
    return (contains);
  }

  public static remove(element: any, arr: any[]) {
    const filter = arr.filter((e: any) => e !== element);
    return filter;
  }

  public static filterId(id: any, data: any[]) {
    const responseData: any[] = [];
    if (id.indexOf(',') > -1) {
      const splitIds = id.split(',');
      splitIds.forEach((splitId: any) => {
        data.forEach((datum: any) => {
          if (splitId === datum.stix.id) {
            responseData.push(datum.stix);
          }
        });
      });
    } else if (id) {
      data.forEach((datum: any) => {
        if (datum.stix.id === id) {
          responseData.push(datum.stix);
        }
      });
    }
    return responseData;
  }

  public static filterType(type: any, data: any[]) {
    const responseData: any[] = [];
    if (type.indexOf(',') > -1) {
      const splitTypes = type.split(',');
      splitTypes.forEach((splitType: any) => {
        data.forEach((datum: any) => {
          if (splitType === datum.stix.type) {
            responseData.push(datum.stix);
          }
        });
      });
    } else if (type) {
      data.forEach((datum: any) => {
        if (datum.stix.type === type) {
          responseData.push(datum.stix);
        }
      });
    }
    return responseData;
  };

  public static filterVersion(version: any, data: any[]) {
    let responseData = data;

    if (version === 'last') {
      responseData.sort((a: any, b: any) => {
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
      responseData.sort((a: any, b: any) => {
        const dateA = new Date(a.stix.modified);
        const dateB = new Date(b.stix.modified);

        if (dateA > dateB) {
          return -1;
        } else if (dateA < dateB) {
          return 1;
        }
        return 0;
      });

      const filteredData: any[] = [];
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
      const filteredData: any[] = [];
      if (version.indexOf(',') > -1) {
        const splitVersions = version.split(',');
        splitVersions.forEach((splitVersion: any) => {
          responseData.forEach((responseDatum: any) => {
            if (splitVersion === responseDatum.stix.modified) {
              filteredData.push(responseDatum.stix);
            }
          });
        });
      } else if (version) {
        responseData.forEach((responseDatum: any) => {
          if (responseDatum.stix.modified === version) {
            filteredData.push(responseDatum.stix);
          }
        });
      }
      responseData = filteredData;
    }

    return responseData;
  }

  public static getMaxSize(req: Request) {
    let maxSize;
    if ((config as any).autogenerate_roots.enabled) {
      maxSize = (config as any).autogenerate_roots.max_content_length;
    } else {
      const roots: any = Object.getOwnPropertyDescriptor(config, 'roots');
      roots.forEach((root: any) => {
        if (root.path === req.params.root) {
          maxSize = root.max_content_length;
        }
      });
    }
    return maxSize;
  }
}
