const router = require('express').Router();

const testapiController = require('../controllers/testapi');

const validateSaveOas = require('../middlewares/validate-save-oas');
const analyseOas = require('../middlewares/analyse-oas');
const generateTestSuits = require('../middlewares/generate-test-suite');
const executeTestSuite = require('../middlewares/execute-test-suite');

const testingMiddlewares = [
  validateSaveOas.saveOasToFile,
  validateSaveOas.validateAccessToApi,
  analyseOas.transformRoutes,
  generateTestSuits.generateTestSuite,
  executeTestSuite.executeTestSuite,
];

router.post('/testapi', testingMiddlewares, testapiController.postTestApi);

module.exports = router;
