exports.postTestApi = (req, res, next) => {
  console.log('TEST DATA SENT!!');
  res
    .status(200)
    .json({
      testResults: req.testSuiteResults,
      fitnessValues: req.fitnessValues,
      sumFitnessValues: req.sumFitnessValues
    });
};
