const {
  initializeFoodSource,
} = require('../helpers/DABC-HS-algorithm/initialize-food-source');

const { fitness } = require('../helpers/DABC-HS-algorithm/fitness-function');
const { mutate } = require('../helpers/DABC-HS-algorithm/mutation-funtion');

exports.generateTestSuits = (req, res, next) => {
  // ............................................Initialization Phase.........................................................
  const populationSize = Object.keys(req.routes).length;
  const trials = new Array(populationSize).fill(0);

  // maximum number of fitness evaluations
  let mfe = 50;

  // first population => currentPopulation
  const currentPopulation = initializeFoodSource(req.routes);
  const populationKeys = Object.keys(currentPopulation);
  const routesKeys = Object.keys(req.routes);

    console.log(
      '............................................Initialization Phase.........................................................'
    );
    console.log(currentPopulation);
  // ....................................................END..................................................................

  // ............................................Employed Bee phase...........................................................
  for (let i = 0; i < populationSize; i++) {
    const testCase = currentPopulation[populationKeys[i]]['testCase'];
    const numbers = currentPopulation[populationKeys[i]]['numbers'];

    const newTestCase = mutate(
      testCase,
      req.routes[routesKeys[i]]
    );

    const oldFitnessValue = fitness(testCase, numbers);

    const newFitnessValue = fitness(newTestCase, numbers);

    if (newFitnessValue > oldFitnessValue) {
      currentPopulation[populationKeys[i]]['testCase'] = newTestCase;
      trials[i] = 0;
    } else {
      trials[i]++;
    }
  }
  console.log(
    '............................................Employed Bee phase...........................................................'
  );
  console.log(currentPopulation);
  console.log(trials);

  next();
};
