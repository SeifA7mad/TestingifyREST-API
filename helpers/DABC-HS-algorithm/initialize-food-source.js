const {
  generateRandomInt,
  generateNominalValue,
  isFinite,
} = require('../generate-values');

const generateChromosome = (operatrionObj) => {
  const chromosome = {
    parameters: [],
    properties: [],
  };

  if (operatrionObj.parameters.length > 0) {
    operatrionObj.parameters.forEach((param) => {
      if (param.required || generateRandomInt(1)) {
        chromosome.parameters.push({
          name: param.name,
          schema: param.schema,
          value: generateNominalValue(param.schema),
          isFinite: isFinite(param.schema),
        });
      }
    });
  }

  if (operatrionObj.requestBody) {
    const properties = operatrionObj.requestBody.properties;
    const requiredProperties =
      operatrionObj.requestBody.requiredProperties;

    for (let prop in properties) {
      if (
        requiredProperties.includes(prop.toString()) ||
        generateRandomInt(1)
      ) {
        chromosome.properties.push({
          name: prop.toString(),
          schema: properties[prop],
          value: generateNominalValue(properties[prop]),
          isFinite: isFinite(properties[prop]),
        });
      }
    }
  }

  return chromosome;
};

const initializeFoodSource = (routeObj, routeKeys, size) => {
  const population = [];
  let randomOperation;
  let genome;

  // generate random size for the population from min:1 to max:size
  const randomStopCondition = generateRandomInt(size, 1);

  for (let i = 0; i < randomStopCondition; i++) {
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
