import * as yargs from 'yargs';

yargs.alias('h', 'host')
    .describe('h', 'Host name and/or IP address for MongoDB')

    .alias('p', 'port')
    .describe('p', 'Port for MongoDB')

    .alias('c', 'certificate')
    .describe('c', 'Absolute path to certificate file for Mutual TLS authentication (cert, key, and ca required for mutual TLS)')

    .alias('k', 'key')
    .describe('k', 'Absolute path to key file for Mutual TLS authentication (cert, key, and ca required for mutual TLS)')

    .alias('a', 'certificate-authority')
    .describe('a', 'Absolute path to certificate authority file for Mutual TLS authentication (cert, key, and ca required for mutual TLS)')

    .help('help');

const argv = yargs.argv;

export default argv;
