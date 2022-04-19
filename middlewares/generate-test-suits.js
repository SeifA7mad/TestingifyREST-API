const {
  initializeFoodSources,
  initializeFoodSource,
} = require('../helpers/DABC-HS-algorithm/initialize-food-source');

const { fitness } = require('../helpers/DABC-HS-algorithm/fitness-function');
const {
  mutate,
  mutateStructure,
} = require('../helpers/DABC-HS-algorithm/mutation-funtion');

const calculateProbabilities = (fitnessValues, maxFit) => {
  const probabilities = [];
  fitnessValues.forEach(value => {
    const propValue = 0.9 * (value / maxFit) + 0.1;
    probabilities.push(propValue);
  });

  return probabilities;
}

exports.generateTestSuits = (req, res, next) => {
  //! ............................................Initialization Phase..........................................................
  const populationSize = Object.keys(req.routes).length;
  const trials = new Array(populationSize).fill(0);
  const fitnessValues = new Array(populationSize);
  // maximum number of fitness evaluations
  const mfe = 100;
  // maximum value of fitness function
  const mfv = populationSize * 3;
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
    const prob = calculateProbabilities(fitnessValues, mfv);
    let j = 0
    let k = 0;
    while (k < populationSize) {
      if (Math.random() < prob[j]) {
        const testCase = currentPopulation[populationKeys[j]]['testCase'];
        const numbers = currentPopulation[populationKeys[j]]['numbers'];

        const newTestCase = mutateStructure(
          testCase,
          req.routes[routesKeys[j]]
        );

        const oldFitnessValue = fitness(testCase, numbers);

        const newFitnessValue = fitness(newTestCase, numbers);

        if (newFitnessValue > oldFitnessValue) {
          currentPopulation[populationKeys[j]]['testCase'] = newTestCase;
          trials[j] = 0;
          fitnessValues[j] = newFitnessValue;
        } else {
          trials[j]++;
          fitnessValues[j] = oldFitnessValue;
        }
        k++;
      }
      j = ++j % populationSize;
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
  req.testSuite = currentPopulation;
  next();
};
