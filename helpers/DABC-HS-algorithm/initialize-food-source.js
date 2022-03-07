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
    initialPopulationType[generateRandomInt(initialPopulationType.length)];

  if (initType === 'randomSampling') {
    const routeKeys = Object.keys(routeObj);
    const randomStopCondition = generateRandomInt(routeKeys.length, 1);

    let randomChoice = null;
    for (let i = 0; i < randomStopCondition; i++) {
      randomChoice = generateRandomInt(routeKeys.length - 1, 0);
      if (!initialPopulation.chromosomes.includes(routeKeys[randomChoice])) {
        initialPopulation.chromosomes.push(routeKeys[randomChoice]);
      }
    }
  }
  console.log(initialPopulation);
};

module.exports = {
  initializeFoodSource,
};
