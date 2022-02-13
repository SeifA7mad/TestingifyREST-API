const router = require('express').Router();

const testapiController = require('../controllers/testapi');

router.post('/testapi', testapiController.postTestApi);

module.exports = router;