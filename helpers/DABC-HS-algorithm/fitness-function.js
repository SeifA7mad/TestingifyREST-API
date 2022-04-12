exports.fitness = (testCase, numbers) => {
  // check Operations Coverage
  // by: dividing number of distinct operations in the current testcase / total expected number of operations
  const numberOfOperations = new Set(testCase.map((ch) => ch.operation)).size;
  const operationCoverage =
    numberOfOperations / numbers.totalNumberOfOperations;

  // check Paramters Coverage
  // by: dividing number of overall inputs used in testcase / total expected number of inputs
  let parameterCoverage = 0;
  if (numbers.totalNumberOfInputs != 0) {
    const numberOfInputs = new Set(
      testCase.reduce((filteredCh, ch) => {
        filteredCh.push(...ch.parameters.map((param) => param.name));
        filteredCh.push(...ch.properties.map((prop) => prop.name));
        return filteredCh;
      }, [])
    ).size;
    parameterCoverage = numberOfInputs / numbers.totalNumberOfInputs;
  }

  // check Inputs value Coverage
  // by: dividing number of distinct finite values(boolean|enums) used in testcase / total expected finite values
  let inputValueCoverage = 0;
  if (numbers.totalNumberOfFiniteValues != 0) {
    const finiteInputs = [];
    // filter from parametrs&properties the finite values only
    // add to an array
    testCase.forEach((ch) => {
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
  // total number of expected status code: number of distinct operation in testcase * 2
  const totalNumberOfExpectedStatusCode = numberOfOperations * 2;
  const numberOfExpectedStatusCode = new Set(
    testCase.map((ch) => ch.operation + ch.testType)
  ).size;

  const statusCodeCoverage =
    numberOfExpectedStatusCode / totalNumberOfExpectedStatusCode;

  // check testcase size -> more is worst
  const testCaseSizeCoverage = testCase.length / numbers.maxTestcaseSize;

  // check Mutated Paramters Coverage
  // by: dividing number of overall mutated inputs used in testcase / total expected number of mutated inputs
  // only in mutation test cases type
  // !STILL IN TESTING........................................
  // const numberOfMutatedInputs = new Set(
  //   testCase.reduce((filteredCh, ch) => {
  //     ch.testType === 'mutation'
  //     ? filteredCh.push(...ch.mutationApplied.map((ma) => ma.inputName))
  //       : null;
  //     return filteredCh;
  //   }, [])
  // ).size;
  // const mutatedParameterCoverage =
  //   numberOfMutatedInputs / numbers.totalNumberOfInputs;

  return +(fitnessValue =
    operationCoverage +
    parameterCoverage +
    inputValueCoverage +
    statusCodeCoverage -
    testCaseSizeCoverage).toFixed(4);
};
