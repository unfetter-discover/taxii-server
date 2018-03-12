const error = require('./app-error');

module.exports = class extends error {
  constructor(fields) {
    super('Invalid UUID present in collections file');
    this.fields = fields || {};
  }
};