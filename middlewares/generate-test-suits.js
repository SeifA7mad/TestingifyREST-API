const {
  initializeFoodSources,
  initializeFoodSource,
} = require('../helpers/DABC-HS-algorithm/initialize-food-source');

const { fitness } = require('../helpers/DABC-HS-algorithm/fitness-function');
const {
  mutate,
  mutateStructure,
} = require('../helpers/DABC-HS-algorithm/mutation-funtion');

exports.generateTestSuits = (req, res, next) => {
  //! ............................................Initialization Phase.........................................................
  const populationSize = Object.keys(req.routes).length;
  const trials = new Array(populationSize).fill(0);
  const fitnessValues = new Array(populationSize);
  // maximum number of fitness evaluations
  const mfe = 100;
  // The maximum number of the trials to determine exhausted sources
  const limit = 3;
  // first population => currentPopulation
  const currentPopulation = initializeFoodSources(req.routes);
  const populationKeys = Object.keys(currentPopulation);
  const routesKeys = Object.keys(req.routes);

  console.log('INITIALIZED POPULATION');
  console.log(currentPopulation);
  //! ....................................................END....................................................................
  for (let fe = 0; fe < mfe; fe++) {
    //! ............................................Employed Bee phase...........................................................
    for (let i = 0; i < populationSize; i++) {
      const testCase = currentPopulation[populationKeys[i]]['testCase'];
      const numbers = currentPopulation[populationKeys[i]]['numbers'];

      const newTestCase = mutate(testCase, req.routes[routesKeys[i]]);

      const oldFitnessValue = fitness(testCase, numbers);

      const newFitnessValue = fitness(newTestCase, numbers);

      if (newFitnessValue > oldFitnessValue) {
        currentPopulation[populationKeys[i]]['testCase'] = newTestCase;
        trials[i] = 0;
        fitnessValues[i] = newFitnessValue;
      } else {
        trials[i]++;
        fitnessValues[i] = oldFitnessValue;
      }
    }
    //! ....................................................END..................................................................

    //! ............................................Onlooker Bee phase...........................................................
    for (let i = 0; i < populationSize; i++) {
      if (Math.random() > 1 / populationSize) {
        continue;
      }
      const testCase = currentPopulation[populationKeys[i]]['testCase'];
      const numbers = currentPopulation[populationKeys[i]]['numbers'];

      const newTestCase = mutateStructure(testCase, req.routes[routesKeys[i]]);

      const oldFitnessValue = fitness(testCase, numbers);

      const newFitnessValue = fitness(newTestCase, numbers);

      if (newFitnessValue > oldFitnessValue) {
        currentPopulation[populationKeys[i]]['testCase'] = newTestCase;
        trials[i] = 0;
        fitnessValues[i] = newFitnessValue;
      } else {
        trials[i]++;
        fitnessValues[i] = oldFitnessValue;
      }
    }
    //! ....................................................END..................................................................

    //! ............................................Scout Bee phase..............................................................
    for (let i = 0; i < populationSize; i++) {
      if (trials[i] > limit) {
        currentPopulation[populationKeys[i]] = initializeFoodSource(
          req.routes[routesKeys[i]]
        );
        fitnessValues[i] = fitness(
          currentPopulation[populationKeys[i]]['testCase'],
          currentPopulation[populationKeys[i]]['numbers']
        );
      }
    }
    //! ....................................................END...................................................................
  }
  console.log('POPULATION AFTER ALGO.');
  console.log(currentPopulation);
  console.log(fitnessValues);
  next();
};
