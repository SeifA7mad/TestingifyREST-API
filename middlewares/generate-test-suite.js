const DABCHS_algo = require("../helpers/DABC-HS-algorithm/DABCHS_Algorithm");


exports.generateTestSuite = (req, res, next) => {

  const DABC_results = DABCHS_algo(req.routes, true);
  const ABC_results = DABCHS_algo(req.routes, false);

  req.DABC_results = DABC_results;
  req.ABC_results = ABC_results;
  next();
};
