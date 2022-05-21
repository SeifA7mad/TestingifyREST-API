const {
  generateNominalValue,
  isFinite,
  generateRandomInt,
} = require('../generate-values');

const Genome = require('../classes/Genome');

module.exports = class Chromosome {
  constructor(operation, testType, parameters, properties) {
    this.operation = operation;
    this.testType = testType;
    this.parameters = parameters;
    this.properties = properties;
    this.mutationApplied = null;
  }

  static generateChromosome = (operationName, testType, operatrionObj) => {
    const parameters = [];
    const properties = [];

    if (operatrionObj.parameters.length > 0) {
      operatrionObj.parameters.forEach((param) => {
        if (param.required || generateRandomInt(1)) {
          parameters.push(
            new Genome(
              param.name,
              param.schema,
              param.required,
              param.schema.type === 'string' && param.example
                ? param.example
                : generateNominalValue(param.schema),
              isFinite(param.schema)
            )
          );
        }
      });
    }

    if (operatrionObj.requestBody) {
      operatrionObj.requestBody.properties.forEach((prop) => {
        if (prop.required || generateRandomInt(1)) {
          properties.push(
            new Genome(
              prop.name,
              prop.schema,
              prop.required,
              generateNominalValue(prop.schema),
              isFinite(prop.schema)
            )
          );
        }
      });
    }

    return new Chromosome(operationName, testType, parameters, properties);
  };
};
