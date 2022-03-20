const {
  initializeFoodSource,
} = require('../helpers/DABC-HS-algorithm/initialize-food-source');

const { fitness } = require('../helpers/DABC-HS-algorithm/fitness-function');
const { mutation } = require('../helpers/DABC-HS-algorithm/mutation-funtion');

exports.generateTestSuits = (req, res, next) => {
  // Initialization Phase
  const populationSize = Object.keys(req.routes).length;
  const trials = new Array(populationSize).fill(0);

  // maximum number of fitness evaluations
  let mfe = 50;

  const currentPopulation = initializeFoodSource(req.routes);
  const populationKeys = Object.keys(currentPopulation);

  console.log(
    currentPopulation[populationKeys[0]]['testCase'],
    '\n',
    fitness(
      currentPopulation[populationKeys[0]]['testCase'],
      currentPopulation[populationKeys[0]]['numbers']
    )
  );

  const newTestCase = mutation(
    currentPopulation[populationKeys[0]]['testCase'],
    req.routes[Object.keys(req.routes)[0]]
    // 1 / currentPopulation[populationKeys[0]]['testCase'].length,
  );

  console.log('AFTER MUTATION');
  console.log(
    newTestCase,
    '\n',
    fitness(newTestCase, currentPopulation[populationKeys[0]]['numbers'])
  );

  // Employed bee Phase
  // for (let i = 0; i < populationSize; i++) {
  //   console.log(
  //     currentPopulation[populationKeys[i]],
  //     '\n',
  //     fitness(
  //       currentPopulation[populationKeys[i]]['testCase'],
  //       currentPopulation[populationKeys[i]]['numbers']
  //     )
  //   );
  // }

  // mutation(
  //   currentPopulation[populationKeys[0]]['testCase'],
  //   1 / currentPopulation[populationKeys[0]]['numbers'].totalNumberOfInputs
  // );

  next();
};
