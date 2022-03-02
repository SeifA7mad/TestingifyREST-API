const router = require('express').Router();

const testapiController = require('../controllers/testapi');

const validateSaveOas = require('../middlewares/validate-save-oas');
const analyseOas = require('../middlewares/analyse-oas');
const generateTestSuits = require('../middlewares/generate-test-suits')

const testingMiddlewares = [
  validateSaveOas.saveOasToFile,
  validateSaveOas.validateAccessToApi,
  analyseOas.transformRoutes,
  generateTestSuits.generateTestSuits
];

router.post(
  '/testapi',
  testingMiddlewares,
  testapiController.postTestApi
);

module.exports = router;
