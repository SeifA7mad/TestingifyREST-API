const router = require('express').Router();

const testapiController = require('../controllers/testapi');

const validateSaveOas = require('../middlewares/validate-save-oas');

const testingMiddlewares = [
  validateSaveOas.saveOasToFile,
  validateSaveOas.validateAccessToApi,
];

router.post(
  '/testapi',
  testingMiddlewares,
  testapiController.postTestApi
);

module.exports = router;
