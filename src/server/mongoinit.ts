import mongoose from './init';
import MongooseModels from '../models/mongoose-models';

/**
 * @returns Promise
 * @description Gets configurations from DB
 */
function getConfig(): Promise<string> {
    return new Promise((resolve, reject) => {
    const promises = [];

    promises.push(MongooseModels.configModel.find({}).exec());

    Promise.all(promises)
        .then(([configurations]: [any[]]) => {
            if (configurations && configurations.length) {
                global.unfetterconfigurations = configurations
                    .map((config: any) => config.toObject());
            }
            resolve('Configuriations retrieved');
        })
        .catch((err) => reject(`Unable to get configurations: ${err}`));
    });
}

/**
 * @param {string} connString
 * @returns Promise<string>
 * @description Starts mongodb
 */
export default function mongoInit(connString: string): Promise<string> {
    return new Promise((resolve, reject) => {
        mongoose.connect(connString, {
            server: {
                poolSize: 5,
                reconnectTries: 100,
                socketOptions: {
                    keepAlive: 300000,
                    connectTimeoutMS: 30000
                }
            }
        });
        
        const db = mongoose.connection;
        
        db.on('connected', () => {
            // resolve(`Connected to mongodb at ${connString}`)
            getConfig()
                .then((msg: string) => {
                    console.log(msg);
                    resolve(`Connected to mongodb at ${connString}`);
                })
                .catch((err) => reject(err));
        });
        
        db.on('disconnected', () => console.log('Disconnected from mongodb'));
        
        process.on('SIGINT', () => {
            db.close(() => {
                console.log('Safely closed MongoDB Connection');
                process.exit(0);
            });
        });
    });
}
