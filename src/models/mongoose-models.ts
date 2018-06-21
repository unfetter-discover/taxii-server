import { Schema, Model, model, Connection } from 'mongoose';

export default class MongooseModels {
    public static readonly configModel: Model<any> = model<any>('config', new Schema({}, { strict: false }), 'config');

    public static getStixModel(mongoConn: Connection): Model<any> {
        const collection: string = (process.env.NODE_ENV && process.env.NODE_ENV.toUpperCase() === 'TEST') ? 'teststix' : 'stix';

        return mongoConn.model('stix', new Schema({
            _id: String,
            stix: {
                created: Date,
                modified: Date,
                first_seen: Date,
                last_seen: Date,
                published: Date,
                valid_from: Date,
                valid_until: Date,
                valid_to: Date,
                first_observed: Date,
                last_observed: Date
            }
        }, {
            strict: false
        }), collection);
    }
}
