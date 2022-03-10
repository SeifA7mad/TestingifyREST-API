const { generateRandomInt, generateValue } = require('../generate-values');
const { getPropertyName } = require('../transform-names');

const smartSampling = [
  ['post', 'get'],
  ['post'],
  ['post', 'put'],
  ['post', 'patch'],
  ['post', 'delete'],
  ['get', 'delete'],
  ['get'],
];

const populationType = ['randomSampling', 'smartSampling'];

const generateChromosome = (operatrionObj) => {
  // const chromosome = {
  //   parameters: {},
  //   bodyContent: [],
  // };

  // if (operatrionObj.inputs.parameters.length > 0) {
  //   let paramName;
  //   operatrionObj.inputs.parameters.forEach((param) => {
  //     paramName = getPropertyName(param.name, operatrionObj.prefixingValue);
  //     chromosome.parameters[param.name] = dictionary[paramName].value;
  //   });

  //   // const URITemplate = parse(operatrionObj.basicUri);
  //   // chromosome.URI = URITemplate.expand(chromosome.genes.parameters);
  // }

  // return chromosome;
};

const initializeFoodSource = (routeObj) => {
  // const population = {};

  // const routeKeys = Object.keys(routeObj);

  // if (routeKeys.length === 1) {
  //   population[routeKeys[0]] = generateChromosome(
  //     routeObj[routeKeys[0]]
  //   );
  //   return;
  // }

  // const initType = populationType[generateRandomInt(populationType.length - 1)];
  // let operationsOrder = [];

  // if (initType === 'randomSampling') {
  //   const randomStopCondition = generateRandomInt(routeKeys.length, 1);

  //   let randomChoice = null;
  //   for (let i = 0; i < randomStopCondition; i++) {
  //     randomChoice = generateRandomInt(routeKeys.length - 1);
  //     operationsOrder.push(routeKeys[randomChoice]);
  //   }
  // }

  // if (initType === 'smartSampling') {
  //   let foundSample = true;
  //   let randomSmartChoice;

  //   while (foundSample) {
  //     randomSmartChoice = generateRandomInt(smartSampling.length - 1);
  //     if (
  //       smartSampling[randomSmartChoice].some((op) => routeKeys.includes(op))
  //     ) {
  //       operationsOrder = smartSampling[randomSmartChoice];
  //       foundSample = false;
  //     }
  //   }
  // }

  // operationsOrder.forEach((op) => {
  //   if (routeObj[op]) {
  //     population[op] = generateChromosome(routeObj[op]);
  //   }
  // });
};

module.exports = {
  initializeFoodSource,
};
