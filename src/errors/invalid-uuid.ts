import AppError from './app-error';

export default class extends AppError {
  public fields: any;
  constructor(fields: any) {
    super('Invalid UUID present in collections file');
    this.fields = fields || {};
  }
}
