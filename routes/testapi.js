const router = require('express').Router();

const testapiController = require('../controllers/testapi');

const validateSaveOas = require('../middlewares/validate-save-oas');
const analyseOas = require('../middlewares/analyse-oas');
const generateTestSuits = require('../middlewares/generate-test-suite');
const executeTestSuite = require('../middlewares/execute-test-suite');

const testingExecutionMiddlewares = [
  validateSaveOas.validateAccessToApi,
  analyseOas.transformRoutes,
  generateTestSuits.generateTestSuite,
  executeTestSuite.executeTestSuite,
];

const testingMiddlewares = [
  validateSaveOas.validateAccessToApi,
  analyseOas.transformRoutes,
  generateTestSuits.generateTestSuite,
];

router.post(
  '/testapi-execute',
  testingExecutionMiddlewares,
  testapiController.postTestApi
);

router.post('/testapi', testingMiddlewares, testapiController.postTestApi);

module.exports = router;
