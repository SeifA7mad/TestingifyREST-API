exports.postTestApi = (req, res, next) => {
  console.log('TEST DATA SENT!!');

  res.status(200).json({
    testResults: req.testSuiteResults ? req.testSuiteResults : null,
    routes: Object.keys(req.DABC_results.testSuite),
    DABC_fitnessValues: req.DABC_results.fitnessValues,
    DABC_sumFitnessValues: req.DABC_results.sumFitnessValues,
    ABC_fitnessValues: req.ABC_results.fitnessValues,
    ABC_sumFitnessValues: req.ABC_results.sumFitnessValues
  });
};
