const express = require("express");
const router = express.Router();
const monitorController = require("../../../controllers/admin.controller");
const validate = require('../../../middlewares/validate');
const monitorValidate = require('../../../validations/monitor.validation')


router.get('/:userId', monitorController.getUserMonitors);

router.put(
  '/multi-pause',
  validate(monitorValidate.pauseMonitors),
  monitorController.pauseMonitors,
);

router.put(
  '/multi-play',
  validate(monitorValidate.playMonitors),
  monitorController.playMonitors,
);

router.delete(
  '/multiple-delete',
  validate(monitorValidate.deleteMonitors),
  monitorController.deleteMonitors,
);


//**//////////////// */
router.get(
  '/:id',
  validate(monitorValidate.getMonitorById),
  monitorController.getMonitorById,
);

router.get(
  '/instant-Control',
  monitorController.getInstantControlMonitor,
);

router.get(
  '/instant-Control/:id',
  monitorController.sentRequestInstantControlMonitor,
);

router.put(  
  '/:id/pause',
  validate(monitorValidate.pauseMonitor),
  monitorController.pauseMonitor,
);

router.put(  
  '/:id/play',
  validate(monitorValidate.playMonitor),
  monitorController.playMonitor,
);
router.delete(
  '/:id',
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
// router.post("/", validate(httpValidate.createMonitor),monitorController.createMonitor);
// router.put("/:id", accessToMonitor(), validate(httpValidate.updateMonitor), monitorController.updateMonitor);
// router.get("/:id", accessToMonitor(), validate(httpValidate.getMonitor), monitorController.getMonitor);
// router.post("/:userId", validate(httpValidate.createMonitor),monitorController.adminCreateMonitor);


module.exports = router;