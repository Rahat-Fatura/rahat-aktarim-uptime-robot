const express = require('express');
const auth = require('../../middlewares/auth');
const router = express.Router();
const monitorController = require('../../controllers/monitor.controller');
const cronJobController = require('../../controllers/cronJobMonitor.controller');
const validate = require('../../middlewares/validate');
const { accessToMonitor, accessToCronJob } = require('../../middlewares/monitor');
const monitorValidate = require('../../validations/monitor.validation');

const httpMonitor = require("./monitorRoutes/httpMonitor.route");
const pingMonitor = require("./monitorRoutes/pingMonitor.route");
const keyWordMonitor = require("./monitorRoutes/keyWordMonitor.route");
const portMonitor = require("./monitorRoutes/portMonitor.route");
const cronJobMonitor = require("./monitorRoutes/cronJobMonitor.route");
const maintanance = require("./monitorRoutes/maintanance.route");

router.use('/http', auth('getUsers'), httpMonitor);
router.use('/ping', auth('getUsers'), pingMonitor);
router.use('/keyword', auth('getUsers'), keyWordMonitor);
router.use('/port', auth('getUsers'), portMonitor);
router.use('/cronjob', auth('getUsers'), cronJobMonitor);
router.use('/maintanance',auth('getUsers'), maintanance);

router.get("/heartbeat/:token",accessToCronJob(), cronJobController.cronJobMonitor);
router.get('/', auth('getUsers'), monitorController.getMonitor);

router.get(
  '/:id',
  auth('getUsers'),
  accessToMonitor(),
  validate(monitorValidate.getMonitorById),
  monitorController.getMonitorById,
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
  '/instant-Control/:id',
  auth('getUsers'),
  accessToMonitor(),
  monitorController.sentRequestInstantControlMonitor,
);


router.get('/:userId', auth('manageUsers'), monitorController.getUserMonitors);

router.put(
  '/:id/pause',
  auth('getUsers'),
  accessToMonitor(),
  validate(monitorValidate.pauseMonitor),
  monitorController.pauseMonitor,
);

router.put(  
  '/:id/play',
  auth('getUsers'),
  accessToMonitor(),
  validate(monitorValidate.playMonitor),
  monitorController.playMonitor,
);
router.delete(
  '/:id',
  auth('getUsers'),
  accessToMonitor(),
  validate(monitorValidate.deleteMonitor),
  monitorController.deleteMonitor,
);
/*
router.get(
  '/logs/:userId',
  auth('manageUsers'),
  monitorController.getMonitorWithLogsForAdmin,
);*/
/*
router.get(
  '/maintanance/:userId',
  auth('manageUsers'),
  monitorController.getAdminMaintananceMonitor,
);
*/
module.exports = router; 