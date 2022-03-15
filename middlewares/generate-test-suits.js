const {
  initializeFoodSource,
} = require('../helpers/DABC-HS-algorithm/initialize-food-source');

const { fitness } = require('../helpers/DABC-HS-algorithm/fitness-function');


exports.generateTestSuits = (req, res, next) => {

  const populationSize = Object.keys(req.routes).length;
  const trials = new Array(populationSize).fill(0);

  // maximum number of fitness evaluations
  let mfe = 50;

  const currentPopulation = initializeFoodSource(req.routes);
  const populationKeys = Object.keys(currentPopulation);

  for (let i = 0; i < populationSize; i++) {
    console.log(
      currentPopulation[populationKeys[i]],
      '\n',
      fitness(
        currentPopulation[populationKeys[i]]['testCase'],
        currentPopulation[populationKeys[i]]['numbers']
      )
    );
  }
  
  next();
};
