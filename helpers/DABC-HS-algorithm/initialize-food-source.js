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
      if (param.required || generateRandomInt(1)) {
        chromosome.parameters.push({
          name: param.name,
          value: generateNominalValue(param.schema),
          isFinite: param.numberOfPossiableValues > 0 ? true : false,
        });
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
  let randomOperation;
  let genome;

  for (let i = 0; i < size; i++) {
    randomOperation = generateRandomInt(routeKeys.length - 1);
    genome = {
      operation: routeKeys[randomOperation],
      testType: 'nominal',
      ...generateChromosome(routeObj[routeKeys[randomOperation]]),
    };
    population.push(genome);
  }

  return population;
};

module.exports = {
  initializeFoodSource,
};
