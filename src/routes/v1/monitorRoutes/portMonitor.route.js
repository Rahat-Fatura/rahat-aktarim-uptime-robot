const express = require("express");
const router = express.Router();
const  monitorController = require("../../../controllers/portMonitor.controller");
const portValidate = require('../../../validations/portMonitor.validation');
const validate = require('../../../middlewares/validate');
const { accessToMonitor } = require('../../../middlewares/monitor');

router.post("/", validate(portValidate.createMonitor), monitorController.createMonitor);
router.put("/:id", accessToMonitor(),validate(portValidate.updateMonitor), monitorController.updateMonitor);
router.get("/:id", accessToMonitor(),validate(portValidate.getMonitor), monitorController.getMonitor)



module.exports = router;