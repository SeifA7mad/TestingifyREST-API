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
  if (numbers.totalNumberOfFinitValues != 0) {
    const finitParams = [];
    population.forEach((ch) => {
      finitParams.push(...ch.parameters.filter((param) => param.isFinite));
    });
    const numberOfFiniteValues = new Set(
      finitParams.map((param) => param.value)
    ).size;

    parameterValueCoverage =
      numberOfFiniteValues / numbers.totalNumberOfFinitValues;
  }

  // TODO: check Status code coverage
};
