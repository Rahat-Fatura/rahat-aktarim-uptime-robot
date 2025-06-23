const express = require("express");
const router = express.Router();
const monitorController = require("../../../controllers/cronJobMonitor.controller");
const validate = require('../../../middlewares/validate');
const cronJobValidate = require('../../../validations/cronJobMonitor.validate')
const { accessToMonitor, accessToCronJob } = require('../../../middlewares/monitor');

router.post("/", validate(cronJobValidate.createMonitor), monitorController.createMonitor);
router.put("/:id", validate(cronJobValidate.updateMonitor),  accessToMonitor(), monitorController.updateMonitor);
router.get("/:id", validate(cronJobValidate.getMonitor), accessToMonitor(), monitorController.getMonitor);
router.post("/:userId", validate(cronJobValidate.createMonitor), monitorController.adminCreateMonitor);

module.exports = router;