import { Arguments } from 'yargs';

import * as _config from '../../assets/config.json';
import argv from './cli.service';
import Config from '../models/config';

/**
 * @param  {any} sslConfig
 * @param  {Arguments} cliArgs
 * @returns any
 * @description determines if all arguments for ssl connection are present
 */
function getSsl(sslConfig: any, cliArgs: Arguments): any {
    const certPath = cliArgs.certificate || process.env.SERVER_CERTIFICATE || sslConfig && sslConfig.certPath;
    const keyPath = cliArgs.key || process.env.SERVER_KEY || sslConfig && sslConfig.keyPath;
    const caPath = cliArgs.certificateAuthority || process.env.SERVER_CA || sslConfig && sslConfig.caPath;
    if (certPath && keyPath && caPath) {
        return {
            certPath,
            keyPath,
            caPath
        };
    } else {
        return null;
    }
}

/**
 * @param  {Arguments} cliArgs
 * @returns Config
 * @description Reads configuration file, applies command line arguments, 
 * environment variables, and testing considering changes as needed.
 */
export function generateConfiguration(cliArgs: Arguments): Config {
    let retVal: Config = _config as any;    

    if (cliArgs.host || process.env.MONGO_REPOSITORY) {
        retVal.mongo_host = cliArgs.host || process.env.MONGO_REPOSITORY;
    }

    if (cliArgs.port || process.env.MONGO_PORT) {
        retVal.mongo_port = cliArgs.port || process.env.MONGO_PORT;
    }

    retVal.connection_string = `mongodb://${retVal.mongo_host}:${retVal.mongo_port}/`;

    if (getSsl(retVal.ssl, cliArgs)) {
        retVal.ssl = getSsl(retVal.ssl, cliArgs);
    }

    // insert any config changes for testing here
    if (process.env.NODE_ENV && process.env.NODE_ENV.toUpperCase() === 'TEST') {
        console.log('Applying test configurations');
        if (retVal.ssl) {
            delete retVal.ssl;
        }
        retVal.express_port = 4567;
    }

    return retVal;
}

const config = generateConfiguration(argv);

export default config;
