const AABC_algo = require('../helpers/A-ABC-algorithm/AABC_Algorithm');


exports.generateTestSuite = (req, res, next) => {

  const DABC_results = AABC_algo(req.routes, true);
  const ABC_results = AABC_algo(req.routes, false);

  req.DABC_results = DABC_results;
  req.ABC_results = ABC_results;
  next();
};
