const {
  initializeFoodSource,
} = require('../helpers/DABC-HS-algorithm/initialize-food-source');

exports.generateTestSuits = (req, res, next) => {
  for (let route in req.routes) {
    initializeFoodSource(route, req.routes[route]);
  }
  next();
};
