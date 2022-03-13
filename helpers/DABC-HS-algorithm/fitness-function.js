exports.fitness = (population, numbers) => {
  // check Operations Coverage
  const numberOfOperations = new Set(population.map((ch) => ch.operation)).size;
  const operationCoverage =
    numberOfOperations / numbers.totalNumberOfOperations;

  // check Paramters Coverage
  const numberOfInputs =
    Math.max(...population.map((ch) => ch.parameters.length)) +
    Math.max(...population.map((ch) => ch.bodyContent.length));
  const parameterCoverage = numberOfInputs / numbers.totalNumberOfInputs;

  // check Parameter value coverage
  let parameterValueCoverage = 0;
  if (numbers.totalNumberOfFiniteValues != 0) {
    const finiteParams = [];
    population.forEach((ch) => {
      finiteParams.push(...ch.parameters.filter((param) => param.isFinite));
    });

    const numberOfFiniteValues = new Set(
      finiteParams.map((param) => param.value)
    ).size;

    parameterValueCoverage =
      numberOfFiniteValues / numbers.totalNumberOfFiniteValues;
  }

  // check Status code coverage
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
    parameterValueCoverage +
    statusCodeCoverage -
    populationSizeCoverage);
};
