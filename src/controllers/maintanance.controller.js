const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { monitorService, maintananceService } = require("../services");
const { maintananceJob } = require("../Jobs/maintananceJob");
const { maintananceWorker } = require("../Jobs/maintanaceWorker");

maintananceJob();
maintananceWorker();

const getMaintananceMonitor = catchAsync(async (req, res) => {
  let monitors = await monitorService.getMaintenance(req.user.id);
  if (!monitors) {
    throw new Error("Monitor not found");
  }
  res.status(httpStatus.OK).send(monitors);
});

const getAdminMaintananceMonitor = catchAsync(async (req, res) => {
  let monitors = await monitorService.getMaintenance(req.params.userId);
  if (!monitors) {
    throw new Error("Monitor not found");
  }
  res.status(httpStatus.OK).send(monitors);
});

const createMaintananceMonitor = catchAsync(async (req, res) => {
  let monitor = await monitorService.getMonitorById(req.params.id, true);
  let maintanance = null;
  if (monitor.maintanance) {
    if (!monitor.maintanance.status) {
      const body = {
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        timeZone: req.body.timeZone,
        controlTime: req.body.startTime,
        status: true,
      };
      maintanance = await maintananceService.updateMaintananceById(
        monitor.maintanance.id,
        body
      );
    }
  } else {
    maintanance = await maintananceService.createMaintanance(
      req.params.id,
      req.body
    );
  }

  if (!maintanance) {
    throw new Error("Maintanance not created");
  }

  monitor = await monitorService.getMonitorById(maintanance.id, false);
  const response = {
    id: monitor.id,
    name: monitor.name,
    host: monitor.host,
    status: monitor.status,
    maintanance: {
      startTime: maintanance.startTime,
      endTime: maintanance.endTime,
      timeZone: maintanance.timeZone,
      status: maintanance.status,
    },
  };

  res.status(httpStatus.OK).send(response);
});

const stopMaintanance = catchAsync(async (req, res) => {
  const body = {
    startTime: new Date(),
    endTime: new Date(),
    controlTime: new Date(),
    status: false,
  };
  const monitor = await monitorService.getMonitorById(req.params.id, true);
  if (!monitor) {
    throw new Error("Monitor not found");
  }
  const maintananceId = monitor.maintanance.id;
  const maintanance = await maintananceService.updateMaintananceById(
    maintananceId,
    body
  );
  await monitorService.updateMonitorById(req.params.id, {
    status: "uncertain",
    isProcess: false,
  });
  const response = {
    id: monitor.id,
    name: monitor.name,
    host: monitor.host,
    status: monitor.status,
    maintanance: {
      startTime: maintanance.startTime,
      endTime: maintanance.endTime,
      status: maintanance.status,
    },
  };
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  getMaintananceMonitor,
  createMaintananceMonitor,
  stopMaintanance,
  getAdminMaintananceMonitor,
};
