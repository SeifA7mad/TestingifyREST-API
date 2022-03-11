const {
  generateRandomInt,
  generateNominalValue,
} = require('../generate-values');


const generateChromosome = (operatrionObj) => {
  const chromosome = {
    parameters: [],
    bodyContent: [],
  };

  if (operatrionObj.inputs.parameters.length > 0) {
    operatrionObj.inputs.parameters.forEach((param) => {
      if (param.required) {
        chromosome.parameters.push({
          name: param.name,
          value: generateNominalValue(param.schema),
        });
      } else {
        if (generateRandomInt(1)) {
          chromosome.parameters.push({
            name: param.name,
            value: generateNominalValue(param.schema)
          });
        }
      }
    });
  }

  if (operatrionObj.inputs.requestBody.length > 0) {
    operatrionObj.inputs.requestBody.forEach((content) => {
      chromosome.bodyContent.push(generateNominalValue(content.schema));
    });
  }
  return chromosome;
};

const initializeFoodSource = (routeObj, routeKeys, size) => {
  const population = [];
  let testType;
  let randomOperation;
  let genome;

  for (let i = 0; i < size; i++) {
    testType = generateRandomInt(1);
    randomOperation = generateRandomInt(routeKeys.length - 1);
    genome = {
      operation: routeKeys[randomOperation],
      ...generateChromosome(
        routeObj[routeKeys[randomOperation]]
      ),
    };
    population.push(genome);
  }

  console.log(population);
};

module.exports = {
  initializeFoodSource,
};
