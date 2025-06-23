const express = require("express");
const router = express.Router();
const  monitorController = require("../../../controllers/keyWordMonitor.controller");
const validate = require('../../../middlewares/validate');
const keyWordValidate = require('../../../validations/keyWordMonitor.validation');
const { accessToMonitor } = require('../../../middlewares/monitor');

router.post("/", validate(keyWordValidate.createMonitor),monitorController.createMonitor);
router.put("/:id", accessToMonitor(), validate(keyWordValidate.updateMonitor),monitorController.updateMonitor);
router.get("/:id", accessToMonitor(), validate(keyWordValidate.getMonitor),monitorController.getMonitor);
router.post("/:userId", validate(keyWordValidate.createMonitor),monitorController.adminCreateMonitor);


module.exports = router;