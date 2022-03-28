const {
  generateRandomInt,
  generateNominalValue,
  isFinite,
  extractNumberOfPossiableValues,
} = require('../generate-values');

const Genome = require('../classes/Genome');
const Chromosome = require('../classes/Chromosome');

const generateChromosome = (operationName, testType, operatrionObj) => {
  const parameters = [];
  const properties = [];

  if (operatrionObj.parameters.length > 0) {
    operatrionObj.parameters.forEach((param) => {
      if (param.required || generateRandomInt(1)) {
        parameters.push(
          new Genome(
            param.name,
            param.schema,
            param.required,
            param.schema.type === 'string' && param.example
              ? param.example
              : generateNominalValue(param.schema),
            isFinite(param.schema)
          )
        );
      }
    });
  }

  if (operatrionObj.requestBody) {
    operatrionObj.requestBody.properties.forEach((prop) => {
      if (prop.required || generateRandomInt(1)) {
        properties.push(
          new Genome(
            prop.name,
            prop.schema,
            prop.required,
            generateNominalValue(prop.schema),
            isFinite(prop.schema)
          )
        );
      }
    });
  }

  return new Chromosome(operationName, testType, parameters, properties);
};

const initializeFoodSource = (routesObj) => {
  const population = {};

  let maxTestcaseSize;
  let routeKeys;
  let totalNumberOfOperations;
  let totalNumberOfInputs;
  let totalNumberOfFiniteValues;

  let randomOperation;

  // main loop => loop on each api route => return TC (chromosome) for each route
  // why?? => to ensure the path coverage for the Test Suite (each route in the api must have at least one HTTP request to be tested)
  for (let route in routesObj) {
    routeKeys = Object.keys(routesObj[route]);
    totalNumberOfOperations = routeKeys.length;
    totalNumberOfInputs = 0;
    totalNumberOfFiniteValues = 0;
    // each route -> 5 diff operatrion
    // each operation -> 2 diff stutas code '2xx, (4xx, 5xx)'
    // (5 * 2)  = 10
    maxTestcaseSize = 5 * 2;

    // loop to find the totalNumberOfInputs & totalNumberOfFiniteValues for every operation in this route
    routeKeys.forEach((key) => {
      // parameters & requestBody for each operation
      const parameters = routesObj[route][key].parameters;
      const properties = routesObj[route][key].requestBody
        ? routesObj[route][key].requestBody.properties
        : [];

      // total number of inputs (how many parameters + how many properties in body request)
      totalNumberOfInputs += parameters.length + properties.length;

      // map the parametrs & properties schemas into arrays to use it later
      const paramsSchemas = parameters.map((param) => param.schema);
      const propSchemas = properties.map((prop) => prop.schema);

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
      maxTestcaseSize,
    };

    // generate random size for the Test Case from max:size to min:1
    const randomStopCondition = generateRandomInt(maxTestcaseSize, 1);

    const testCase = [];

    for (let i = 0; i < randomStopCondition; i++) {
      randomOperation = generateRandomInt(routeKeys.length - 1);
      testCase.push(
        generateChromosome(
          routeKeys[randomOperation],
          'nominal',
          routesObj[route][routeKeys[randomOperation]]
        )
      );
    }

    population[route] = { testCase, numbers: { ...totalNumbers } };
  }

  return population;
};

module.exports = {
  initializeFoodSource,
};
