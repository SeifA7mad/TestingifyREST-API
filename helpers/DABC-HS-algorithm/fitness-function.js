exports.fitness = (population, numbers) => {
  // check Operations Coverage
  // by: dividing number of distinct operations in the current population / total expected number of operations
  const numberOfOperations = new Set(population.map((ch) => ch.operation)).size;
  const operationCoverage =
    numberOfOperations / numbers.totalNumberOfOperations;

  // check Paramters Coverage
  // by: dividing number of overall inputs used in population / total expected number of inputs
  const numberOfInputs =
    Math.max(...population.map((ch) => ch.parameters.length)) +
    Math.max(...population.map((ch) => ch.properties.length));
  const parameterCoverage = numberOfInputs / numbers.totalNumberOfInputs;

  // check Inputs value Coverage
  // by: dividing number of distinct finite values(boolean|enums) used in population / total expected finite values
  let inputValueCoverage = 0;
  if (numbers.totalNumberOfFiniteValues != 0) {
    const finiteInputs = [];
    // filter from parametrs&properties the finite values only 
    // add to an array
    population.forEach((ch) => {
      finiteInputs.push(...ch.parameters.filter((param) => param.isFinite));
      finiteInputs.push(...ch.properties.filter((prop) => prop.isFinite));
    });

    // make from the finiteInputs array.values a new set to remove the duplicated values
    const numberOfFiniteValues = new Set(
      finiteInputs.map((input) => input.value)
    ).size;

    inputValueCoverage =
      numberOfFiniteValues / numbers.totalNumberOfFiniteValues;
  }

  // check Status code coverage
  // by: dividing number of distinct operations that provides distinct status code (test type: nominal|mutation)
  // / total number of expected status code: number of distinct operation in population * 2
  const totalNumberOfExpectedStatusCode = numberOfOperations * 2;
  const numberOfExpectedStatusCode = new Set(
    population.map((ch) => ch.operation + ch.testType)
  ).size;

  const statusCodeCoverage =
    numberOfExpectedStatusCode / totalNumberOfExpectedStatusCode;

  // check population size -> more is worst
  const populationSizeCoverage = population.length / numbers.maxPopulationSize;

  return (fitnessValue =
    operationCoverage +
    parameterCoverage +
    inputValueCoverage +
    statusCodeCoverage -
    populationSizeCoverage);
};
