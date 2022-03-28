module.exports = class Chromosome {
  constructor(operation, testType, parameters, properties) {
    this.operation = operation;
    this.testType = testType;
    this.parameters = parameters;
    this.properties = properties;
    this.mutationApplied = [];
  }
};