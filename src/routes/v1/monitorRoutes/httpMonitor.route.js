const express = require("express");
const router = express.Router();
const monitorController = require("../../../controllers/httpMonitor.controller");
const validate = require('../../../middlewares/validate');
const httpValidate = require('../../../validations/httpMonitor.validation')
const { accessToMonitor } = require('../../../middlewares/monitor');

router.post("/", validate(httpValidate.createMonitor),monitorController.createMonitor);
router.put("/:id", accessToMonitor(), validate(httpValidate.updateMonitor), monitorController.updateMonitor);
router.get("/:id", accessToMonitor(), validate(httpValidate.getMonitor), monitorController.getMonitor);



module.exports = router;