const {
  generateRandomInt,
  extractFitnessTotalNumbers,
} = require('../generate-values');

const Chromosome = require('../classes/Chromosome');

const initializeFoodSource = (route) => {
  const routeKeys = Object.keys(route);
  // each route -> 5 diff operatrion
  // each operation -> 2 diff stutas code '2xx, (4xx, 5xx)'
  // (5 * 2)  = 10
  const maxTestcaseSize = 5 * 2;

  const totalNumbers = extractFitnessTotalNumbers(route);

  // generate random size for the Test Case from max:size to min:1
  const randomStopCondition = generateRandomInt(maxTestcaseSize, 1);

  const testCase = [];

  for (let i = 0; i < randomStopCondition; i++) {
    const randomOperation = generateRandomInt(routeKeys.length - 1);
    testCase.push(
      Chromosome.generateChromosome(
        routeKeys[randomOperation],
        'nominal',
        route[routeKeys[randomOperation]]
      )
    );
  }

  return {
    testCase,
    numbers: { ...totalNumbers, maxTestcaseSize },
  };
};

const initializeFoodSources = (routesObj) => {
  const population = {};

  // main loop => loop on each api route => return TC (chromosome) for each route
  // why?? => to ensure the path coverage for the Test Suite (each route in the api must have at least one HTTP request to be tested)
  for (let route in routesObj) {
    population[route] = initializeFoodSource(routesObj[route]);
  }

  return population;
};

module.exports = {
  initializeFoodSources,
  initializeFoodSource,
};
