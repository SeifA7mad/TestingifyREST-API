const {
  initializeFoodSources,
  initializeFoodSource,
} = require('./initialize-food-source');

const { fitness } = require('./fitness-function');
const { mutate, mutateStructure } = require('./mutation-funtion');

const calculateProbabilities = (fitnessValues, maxFit) => {
  const probabilities = [];
  fitnessValues.forEach((value) => {
    const propValue = 0.9 * (value / maxFit) + 0.1;
    probabilities.push(propValue);
  });

  return probabilities;
};

const AABC_algo = (routes, useModified) => {
  //! ............................................Initialization Phase..........................................................
  // Np -> Population Size
  const Np = Object.keys(routes).length;
  const trials = new Array(Np).fill(0);
  const fitnessValues = new Array(Np);
  // maximum number of fitness evaluations
  const mfe = 100;
  // maximum value of fitness function
  const mfv = Np * 3.5;
  // The maximum number of the trials to determine exhausted sources -> Np x D
  const limit = Np * 5;
  // first population => currentPopulation
  const currentPopulation = initializeFoodSources(routes);
  const populationKeys = Object.keys(currentPopulation);
  const routesKeys = Object.keys(routes);

  const archive = new Array(Np);
  const sumFitnessValues = [];
  let foundBestSolution = false;
  //! ....................................................END....................................................................

  for (let fe = 0; fe < mfe; fe++) {
    //! ............................................Employed Bee phase...........................................................
    for (let i = 0; i < Np; i++) {
      const testCase = currentPopulation[populationKeys[i]]['testCase'];
      const numbers = currentPopulation[populationKeys[i]]['numbers'];

      const newTestCase = mutate(testCase, routes[routesKeys[i]]);

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
    for (let i = 0, k = 0; k < Np; i = ++i % Np) {
      if (Math.random() > prob[i]) {
        continue;
      }
      const testCase = currentPopulation[populationKeys[i]]['testCase'];
      const numbers = currentPopulation[populationKeys[i]]['numbers'];

      const newTestCase = useModified
        ? mutateStructure(testCase, routes[routesKeys[i]])
        : mutate(testCase, routes[routesKeys[i]]);

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
      k++;
    }
    //! ....................................................END..................................................................

    //! ............................................Scout Bee phase..............................................................
    const filteredTrials = trials
      .map((trial, index) => (trial > limit ? [index, trial] : undefined))
      .filter((trial) => trial !== undefined);

    if (filteredTrials.length > 0) {
      let max = -1;
      let maxTrailIndex;
      for (let i = 0; i < filteredTrials.length; i++) {
        if (max < filteredTrials[i][1]) {
          max = filteredTrials[i][1];
          maxTrailIndex = filteredTrials[i][0];
        }
      }

      if (useModified) {
        // calaculate the fitness value of the test case in the archive & the current test case in the current population
        const archivedFitnessValue = archive[maxTrailIndex]
          ? fitness(
              archive[maxTrailIndex].testCase,
              archive[maxTrailIndex].numbers
            )
          : 0;
        const currentFitnessvalue = fitness(
          currentPopulation[populationKeys[maxTrailIndex]]['testCase'],
          currentPopulation[populationKeys[maxTrailIndex]]['numbers']
        );

        // if the current fitness value > archived fitness value => replace in the archive => for the Hyper-Scout Bee
        if (currentFitnessvalue > archivedFitnessValue) {
          archive[maxTrailIndex] = structuredClone(
            currentPopulation[populationKeys[maxTrailIndex]]
          );
        }
      }

      currentPopulation[populationKeys[maxTrailIndex]] = initializeFoodSource(
        routes[routesKeys[maxTrailIndex]]
      );
      trials[maxTrailIndex] = 0;
      fitnessValues[maxTrailIndex] = fitness(
        currentPopulation[populationKeys[maxTrailIndex]]['testCase'],
        currentPopulation[populationKeys[maxTrailIndex]]['numbers']
      );
    }
    //! ....................................................END...................................................................
    sumFitnessValues.push(fitnessValues.reduce((prev, cur) => prev + cur, 0));
    if (sumFitnessValues[sumFitnessValues.length - 1] >= mfv) {
      foundBestSolution = true;
      break;
    }
  }

  if (useModified && !foundBestSolution) {
    //! ............................................Hyper-Scout Bee phase..............................................................
    // check for better solutions in archive
    let isReplaced = false;

    for (let i = 0; i < Np; i++) {
      const archivedFitness = fitness(archive[i].testCase, archive[i].numbers);
      if (archivedFitness > fitnessValues[i]) {
        currentPopulation[populationKeys[i]] = structuredClone(archive[i]);
        fitnessValues[i] = archivedFitness;
        isReplaced = true;
      }
    }

    if (isReplaced) {
      sumFitnessValues[sumFitnessValues.length - 1] = fitnessValues.reduce(
        (prev, cur) => prev + cur,
        0
      );
    }
    //! ....................................................END........................................................................
  }

  return {
    testSuite: currentPopulation,
    fitnessValues,
    sumFitnessValues,
  };
};

module.exports = AABC_algo;
