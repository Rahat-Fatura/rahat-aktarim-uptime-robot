/* eslint-disable prettier/prettier */
const express = require('express');
const auth = require('../../middlewares/auth');

const router = express.Router();
const monitorController = require('../../controllers/monitor.controller');
const validate = require('../../middlewares/validate');
const { accessToMonitor } = require('../../middlewares/monitor');
const monitorValidate = require('../../validations/monitor.validation');

router.post('/', auth('getUsers'), validate(monitorValidate.createMonitor), monitorController.createMonitor);
router.get('/', auth('getUsers'), monitorController.getMonitor);
router.put(
  '/:monitorId',
  auth('getUsers'),
  accessToMonitor(),
  validate(monitorValidate.updateMonitor),
  monitorController.updateMonitor,
);
router.put(
  '/:monitorId/pause',
  auth('getUsers'),
  accessToMonitor(),
  validate(monitorValidate.pauseMonitor),
  monitorController.pauseMonitor,
);
router.put(
  '/:monitorId/play',
  auth('getUsers'),
  accessToMonitor(),
  validate(monitorValidate.playMonitor),
  monitorController.playMonitor,
);
router.delete(
  '/:monitorId',
  auth('getUsers'),
  accessToMonitor(),
  validate(monitorValidate.deleteMonitor),
  monitorController.deleteMonitor,
);

router.get(
  '/logs',
  auth('getUsers'),
  monitorController.getMonitorWithLogs,
);

router.get(
  '/instant-Control',
  auth('getUsers'),
  monitorController.getInstantControlMonitor,
);

router.get(
  '/instant-Control/:monitorId',
  auth('getUsers'),
  accessToMonitor(),
  monitorController.sentRequestInstantControlMonitor,
);

router.post(
  '/:monitorId/maintanance',
  auth('getUsers'),
  accessToMonitor(),
  validate(monitorValidate.monitorMaintenance), 
  monitorController.createMaintananceMonitor,
);

router.put(
  '/:monitorId/maintanance/cancel',
  auth('getUsers'),
  accessToMonitor(),
  validate(monitorValidate.stopMaintananceJob), 
  monitorController.stopMaintanance,
);

router.put(
  '/:monitorId/maintanance/task/cancel',
  auth('getUsers'),
  accessToMonitor(),
  validate(monitorValidate.stopMaintananceJob), 
  monitorController.cancelMaintananceTask,
);

router.get(
  '/maintanance',
  auth('getUsers'),
  monitorController.getMaintananceMonitor,
);

module.exports = router;
