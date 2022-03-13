const {
  initializeFoodSource,
} = require('../helpers/DABC-HS-algorithm/initialize-food-source');

const { fitness } = require('../helpers/DABC-HS-algorithm/fitness-function');

exports.generateTestSuits = (req, res, next) => {
  // each route -> 5 diff operatrion
  // each operation -> 3 diff stutas code '2xx, 4xx, 5xx'
  // (5 * 3)  = 30
  const populationSize = 5;
  const trials = new Array(populationSize).fill(0);

  // maximum number of fitness evaluations
  let mfe = 50;

  let routeKeys;
  let totalNumberOfOperations;
  let totalNumberOfInputs;
  let totalNumberOfFiniteValues;

  for (let route in req.routes) {
    totalNumberOfInputs = 0;
    totalNumberOfFiniteValues = 0;

    routeKeys = Object.keys(req.routes[route]);
    totalNumberOfOperations = routeKeys.length;
    routeKeys.forEach((key) => {
      totalNumberOfInputs +=
        req.routes[route][key].inputs.parameters.length +
        req.routes[route][key].inputs.requestBody.length;

      const numberOfValues = req.routes[route][key].inputs.parameters.map(
        (param) => param.numberOfPossiableValues
      );

      totalNumberOfFiniteValues += numberOfValues.reduce(
        (prev, cur) => prev + cur,
        0
      );
    });

    const initPopulation = initializeFoodSource(
      req.routes[route],
      routeKeys,
      populationSize
    );

    fitness(initPopulation, {
      totalNumberOfOperations,
      totalNumberOfInputs,
      totalNumberOfFiniteValues,
    });
  }
  next();
};
