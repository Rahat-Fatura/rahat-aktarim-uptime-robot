const express = require("express");
const cronJobController = require('../../controllers/cronJobMonitor.controller');
const {accessToCronJob} = require('../../middlewares/monitor');
const router = express.Router();

router.get("/:token",accessToCronJob(), cronJobController.cronJobMonitor);

module.exports = router;