const express = require("express");
const router = express.Router();
const  monitorController = require("../../../controllers/maintanance.controller");
const validate = require('../../../middlewares/validate');
const maintananceValidate = require('../../../validations/maintanance.validate');
const { accessToMonitor } = require('../../../middlewares/monitor');

router.get("/",monitorController.getMaintananceMonitor);
router.post("/:id", accessToMonitor(),validate(maintananceValidate.monitorMaintenance),monitorController.createMaintananceMonitor);
router.put("/:id", accessToMonitor(), validate(maintananceValidate.stopMaintananceJob),monitorController.stopMaintanance);



module.exports = router;