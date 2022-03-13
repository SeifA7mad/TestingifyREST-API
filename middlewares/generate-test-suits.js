const {
  initializeFoodSource,
} = require('../helpers/DABC-HS-algorithm/initialize-food-source');

const { fitness } = require('../helpers/DABC-HS-algorithm/fitness-function');

const {
  extractNumberOfPossiableValues,
} = require('../helpers/generate-values');

exports.generateTestSuits = (req, res, next) => {
  // each route -> 5 diff operatrion
  // each operation -> 2 diff stutas code '2xx, (4xx, 5xx)'
  // (5 * 2)  = 10
  const maxPopulationSize = 10;
  const trials = new Array(maxPopulationSize).fill(0);

  // maximum number of fitness evaluations
  let mfe = 50;

  let routeKeys;
  let totalNumberOfOperations;
  let totalNumberOfInputs;
  let totalNumberOfFiniteValues;

  // main loop => loop on each api route to run the DABS-HS algorithm on => return the best TC for each route
  // why?? => to ensure the path coverage for the Test Suite (each route in the api must have at least one HTTP request to be tested)
  for (let route in req.routes) {
    // init some values
    routeKeys = Object.keys(req.routes[route]);
    totalNumberOfOperations = routeKeys.length;
    totalNumberOfInputs = 0;
    totalNumberOfFiniteValues = 0;

    // loop to find the totalNumberOfInputs & totalNumberOfFiniteValues for every operation in this route
    routeKeys.forEach((key) => {
      // parameters & requestBody for each operation
      const parameters = req.routes[route][key].inputs.parameters;
      const requestBody = req.routes[route][key].inputs.requestBody;

      // total number of inputs (how many parameters + how many properties in body request)
      totalNumberOfInputs +=
        parameters.length +
        Object.keys(requestBody ? requestBody.properties : {}).length;

      // map the parametrs & properties schemas into arrays to use it later  
      const paramsSchemas = parameters.map((param) => param.schema);
      const propSchemas = requestBody
        ? Object.values(requestBody.properties)
        : [];

      // total number of finite values (extract the number of possiable values for finite type (boolean|enums)
      // from the two schema arrays
      totalNumberOfFiniteValues +=
        extractNumberOfPossiableValues(paramsSchemas) +
        extractNumberOfPossiableValues(propSchemas);
    });

    const totalNumbers = {
      totalNumberOfOperations,
      totalNumberOfInputs,
      totalNumberOfFiniteValues,
      maxPopulationSize,
    };

    const initPopulation = initializeFoodSource(
      req.routes[route],
      routeKeys,
      maxPopulationSize
    );

    const initPopulationFitnessValue = fitness(initPopulation, totalNumbers);

    // console.log(initPopulation, initPopulationFitnessValue);
  }
  next();
};
