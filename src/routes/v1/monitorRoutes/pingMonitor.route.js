const express = require("express");
const router = express.Router();
const  monitorController = require("../../../controllers/pingMonitor.controller");
const pingValidate = require('../../../validations/pingMonitor.validation');
const validate = require('../../../middlewares/validate');
const { accessToMonitor } = require('../../../middlewares/monitor');

router.post("/", validate(pingValidate.createMonitor),monitorController.createMonitor);
router.put("/:id", accessToMonitor(),validate(pingValidate.updateMonitor),monitorController.updateMonitor);
router.get("/:id", accessToMonitor(), validate(pingValidate.getMonitor), monitorController.getMonitor);


module.exports = router;