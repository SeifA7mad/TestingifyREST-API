const { generateRandomInt } = require('../generate-values');

const smartSampling = [
  ['post', 'get'],
  ['post'],
  ['post', 'put'],
  ['post', 'patch'],
  ['post', 'delete'],
];

const initialPopulationType = ['randomSampling', 'smartSampling'];

const initializeFoodSource = (routeName, routeObj) => {
  const initialPopulation = {
    routeName: routeName,
    chromosomes: [],
  };

  const initType =
    initialPopulationType[generateRandomInt(initialPopulationType.length - 1)];

  const routeKeys = Object.keys(routeObj);

  if (initType === 'randomSampling') {
    const randomStopCondition = generateRandomInt(routeKeys.length, 1);

    let randomChoice = null;
    for (let i = 0; i < randomStopCondition; i++) {
      randomChoice = generateRandomInt(routeKeys.length - 1);
      if (!initialPopulation.chromosomes.includes(routeKeys[randomChoice])) {
        initialPopulation.chromosomes.push(routeKeys[randomChoice]);
      }
    }
  }

  if (initType === 'smartSampling') {
    const randomSmartChoice = generateRandomInt(smartSampling.length - 1);
    if (smartSampling[randomSmartChoice].every(op => routeKeys.includes(op))) {
      initialPopulation.chromosomes = smartSampling[randomSmartChoice];
    }
  }

  console.log(initialPopulation);
};

module.exports = {
  initializeFoodSource,
};
