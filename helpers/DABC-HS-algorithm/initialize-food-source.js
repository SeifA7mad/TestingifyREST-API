const { generateRandomInt } = require('../generate-values');

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

const initializeFoodSource = (routeName, routeObj) => {
  const population = {
    routeName: routeName,
    operationsOrder: [],
  };

  const routeKeys = Object.keys(routeObj);

  if (routeKeys.length === 1) {
    population.operationsOrder.push(routeKeys[0]);
    return console.log(population);
  }

  const initType = populationType[generateRandomInt(populationType.length - 1)];

  if (initType === 'randomSampling') {
    const randomStopCondition = generateRandomInt(routeKeys.length, 1);

    let randomChoice = null;
    for (let i = 0; i < randomStopCondition; i++) {
      randomChoice = generateRandomInt(routeKeys.length - 1);
      if (!population.operationsOrder.includes(routeKeys[randomChoice])) {
        population.operationsOrder.push(routeKeys[randomChoice]);
      }
    }
  }

  if (initType === 'smartSampling') {
    let foundSample = true;
    let randomSmartChoice;

    while (foundSample) {
      randomSmartChoice = generateRandomInt(smartSampling.length - 1);
      if (smartSampling[randomSmartChoice].some((op) => routeKeys.includes(op))) {
        population.operationsOrder = smartSampling[randomSmartChoice];
        foundSample = false;
      }
    }
  }

  console.log(population);
};

module.exports = {
  initializeFoodSource,
};
