const {
  generateRandomInt,
  generateNominalValue,
  generateMutatedValue,
} = require('../generate-values');

// const { getPropertyName } = require('../transform-names');

// const smartSampling = [
//   ['post', 'get'],
//   ['post'],
//   ['post', 'put'],
//   ['post', 'patch'],
//   ['post', 'delete'],
//   ['get', 'delete'],
//   ['get'],
// ];

const ChromsomeType = ['nominal', 'mutated'];

const generateChromosome = (operatrionObj, type) => {
  const chromosome = {
    parameters: [],
    bodyContent: [],
  };

  if (operatrionObj.inputs.parameters.length > 0) {
    if (type === 'nominal') {
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
              value: generateNominalValue(param.schema),
            });
          }
        }
      });
    }

    if (type === 'mutated') {
      operatrionObj.inputs.parameters.forEach((param) => {
        if (generateRandomInt(1)) {
          chromosome.parameters.push({
            name: param.name,
            value: generateMutatedValue(param.schema),
          });
        }
      });
    }
  }

  if (operatrionObj.inputs.requestBody.length > 0) {
    
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
      testType: ChromsomeType[testType],
      ...generateChromosome(
        routeObj[routeKeys[randomOperation]],
        ChromsomeType[testType]
      ),
    };
    population.push(genome);
  }

  console.log(population);
};

module.exports = {
  initializeFoodSource,
};
