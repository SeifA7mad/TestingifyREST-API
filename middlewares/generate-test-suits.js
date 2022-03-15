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

  // let routeKeys;
  // let totalNumberOfOperations;
  // let totalNumberOfInputs;
  // let totalNumberOfFiniteValues;

  // // main loop => loop on each api route to run the DABS-HS algorithm on => return the best TC for each route
  // // why?? => to ensure the path coverage for the Test Suite (each route in the api must have at least one HTTP request to be tested)
  // for (let route in req.routes) {
  //   // init some values
  //   routeKeys = Object.keys(req.routes[route]);
  //   totalNumberOfOperations = routeKeys.length;
  //   totalNumberOfInputs = 0;
  //   totalNumberOfFiniteValues = 0;

  //   // loop to find the totalNumberOfInputs & totalNumberOfFiniteValues for every operation in this route
  //   routeKeys.forEach((key) => {
  //     // parameters & requestBody for each operation
  //     const parameters = req.routes[route][key].parameters;
  //     const requestBody = req.routes[route][key].requestBody;

  //     // total number of inputs (how many parameters + how many properties in body request)
  //     totalNumberOfInputs +=
  //       parameters.length +
  //       Object.keys(requestBody ? requestBody.properties : {}).length;

  //     // map the parametrs & properties schemas into arrays to use it later  
  //     const paramsSchemas = parameters.map((param) => param.schema);
  //     const propSchemas = requestBody
  //       ? Object.values(requestBody.properties)
  //       : [];

  //     // total number of finite values (extract the number of possiable values for finite type (boolean|enums)
  //     // from the two schema arrays
  //     totalNumberOfFiniteValues +=
  //       extractNumberOfPossiableValues(paramsSchemas) +
  //       extractNumberOfPossiableValues(propSchemas);
  //   });

  //   const totalNumbers = {
  //     totalNumberOfOperations,
  //     totalNumberOfInputs,
  //     totalNumberOfFiniteValues,
  //     maxPopulationSize,
  //   };

  //   // initialize the first population
  //   const currentPopulation = initializeFoodSource(
  //     req.routes[route],
  //     routeKeys,
  //     maxPopulationSize
  //   );

  //   // const initPopulationFitnessValue = fitness(currentPopulation, totalNumbers);

  //   // console.log(currentPopulation, initPopulationFitnessValue);
  // }
  next();
};
