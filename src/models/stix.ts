import { Schema, Model, model } from 'mongoose';

const stixModel: Model<any> = model<any>('stix', new Schema({ _id: String }, { strict: false, timestamps: true }), 'stix');

export default stixModel;
