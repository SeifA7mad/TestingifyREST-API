const router = require('express').Router();

const testapiController = require('../controllers/testapi');

const analyseOas = require('../middlewares/analyse-oas');

router.post(
  '/testapi',
  analyseOas.saveOasToFile,
  analyseOas.validateAccessToApi,
  testapiController.postTestApi
);

module.exports = router;
