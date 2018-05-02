import { Schema, Model, model } from 'mongoose';

export default class MongooseModels {
    public static readonly configModel: Model<any> = model<any>('config', new Schema({}, { strict: false }), 'config');
}
