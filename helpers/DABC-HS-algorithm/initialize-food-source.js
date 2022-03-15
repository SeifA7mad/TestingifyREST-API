const { route } = require('express/lib/application');
const {
  generateRandomInt,
  generateNominalValue,
  isFinite,
  extractNumberOfPossiableValues,
} = require('../generate-values');

const generateChromosome = (operatrionObj) => {
  const chromosome = {
    parameters: [],
    properties: [],
  };

  if (operatrionObj.parameters.length > 0) {
    operatrionObj.parameters.forEach((param) => {
      if (param.required || generateRandomInt(1)) {
        chromosome.parameters.push({
          name: param.name,
          schema: param.schema,
          value: generateNominalValue(param.schema),
          isFinite: isFinite(param.schema),
        });
      }
    });
  }

  if (operatrionObj.requestBody) {
    const properties = operatrionObj.requestBody.properties;
    const requiredProperties = operatrionObj.requestBody.requiredProperties;

    for (let prop in properties) {
      if (
        requiredProperties.includes(prop.toString()) ||
        generateRandomInt(1)
      ) {
        chromosome.properties.push({
          name: prop.toString(),
          schema: properties[prop],
          value: generateNominalValue(properties[prop]),
          isFinite: isFinite(properties[prop]),
        });
      }
    }
  }

  return chromosome;
};

const initializeFoodSource = (routesObj) => {
  const population = {};

  let maxTestcaseSize;
  let routeKeys;
  let totalNumberOfOperations;
  let totalNumberOfInputs;
  let totalNumberOfFiniteValues;

  let randomOperation;
  let genome;

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
      const requestBody = routesObj[route][key].requestBody;

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
      maxTestcaseSize,
    };
    // generate random size for the population from min:1 to max:size
    const randomStopCondition = generateRandomInt(maxTestcaseSize, 1);

    const testCase = [];

    for (let i = 0; i < randomStopCondition; i++) {
      randomOperation = generateRandomInt(routeKeys.length - 1);
      genome = {
        operation: routeKeys[randomOperation],
        testType: 'nominal',
        ...generateChromosome(routesObj[route][routeKeys[randomOperation]]),
      };
      testCase.push(genome);
    }

    population[route] = { testCase, numbers: { ...totalNumbers } };
  }

  return population;
};

module.exports = {
  initializeFoodSource,
};
