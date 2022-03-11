const {
  initializeFoodSource,
} = require('../helpers/DABC-HS-algorithm/initialize-food-source');

exports.generateTestSuits = (req, res, next) => {
  // each route -> 5 diff operatrion
  // each operation -> 3 diff stutas code '2xx, 4xx, 5xx'
  // (5 * 3)  = 30
  const populationSize = 15;
  const trials = new Array(populationSize).fill(0);

  // maximum number of fitness evaluations
  let mfe = 50;

  let routeKeys;
  const totalNumberOfStatusCode = 3;
  let totalNumberOfOperations;
  let totalNumberOfInputs;

  for (let route in req.routes) {
    routeKeys = Object.keys(req.routes[route]);
    totalNumberOfOperations = routeKeys.length;
    routeKeys.forEach(
      (key) =>
        (totalNumberOfInputs =
          req.routes[route][key].inputs.parameters.length +
          req.routes[route][key].inputs.requestBody.length)
    );

    initializeFoodSource(req.routes[route], routeKeys, populationSize);
  }
  next();
};
