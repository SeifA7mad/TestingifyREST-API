const router = require('express').Router();

const testapiController = require('../controllers/testapi');

const validateSaveOas = require('../middlewares/validate-save-oas');
const analyseOas = require('../middlewares/analyse-oas');

const testingMiddlewares = [
  validateSaveOas.saveOasToFile,
  validateSaveOas.validateAccessToApi,
  analyseOas.transformRoutes
];

router.post(
  '/testapi',
  testingMiddlewares,
  testapiController.postTestApi
);

module.exports = router;
