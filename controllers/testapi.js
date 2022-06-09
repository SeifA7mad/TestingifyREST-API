exports.postTestApi = (req, res, next) => {
  console.log('TEST DATA SENT!!');
  res.status(200).json({
    testResults: req.testSuiteResults ? req.testSuiteResult : null,
    routes: Object.keys(req.testSuite),
    fitnessValues: req.fitnessValues,
    sumFitnessValues: req.sumFitnessValues,
    abcFitnessValues: req.abcFitnessValues,
  });
};
