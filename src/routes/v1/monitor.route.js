const express = require('express');
const auth = require('../../middlewares/auth');

const router = express.Router();
const monitorController = require('../../controllers/monitor.controller');
const validate = require('../../middlewares/validate');
const monitorValidate = require('../../validations/monitor.validation');

router.post('/', auth('getUsers'), validate(monitorValidate.createMonitor), monitorController.createMonitor);
router.get('/', auth('getUsers'), monitorController.getMonitor);
router.put('/:monitorId', auth('getUsers'), validate(monitorValidate.updateMonitor), monitorController.updateMonitor);
router.put('/:monitorId/pause', auth('getUsers'), validate(monitorValidate.pauseMonitor), monitorController.pauseMonitor);
router.put('/:monitorId/play', auth('getUsers'), validate(monitorValidate.playMonitor), monitorController.playMonitor);
router.delete('/:monitorId', auth('getUsers'), validate(monitorValidate.deleteMonitor), monitorController.deleteMonitor);
module.exports = router;
