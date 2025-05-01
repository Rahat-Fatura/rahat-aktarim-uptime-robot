/* eslint-disable no-const-assign */
/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { monitorService, maintananceService } = require('../services');
const { startJob, updateJob, stopJob, renderJobs, startMaintananceJob,
       stopMaintananceJob, stopMaintananceTask, startMaintananceTask,
       renderMaintananceJobs, renderMaintananceTasks } = require('../Jobs/index');
const { generateReportCollective } = require('../Jobs/tasks/reportTask');
const { sendRequest } = require('../Jobs/tasks/monitorTask');

renderMaintananceTasks(maintananceService);
renderMaintananceJobs(maintananceService);
renderJobs(monitorService);

const createMonitor = catchAsync(async (req, res) => {
  let monitor = await monitorService.createMonitor(req.body, req.user);
  if (monitor) {
    startJob(monitor);
  }
  res.status(httpStatus.CREATED).send(monitor);
});

const getMonitor = catchAsync(async (req, res) => {
  const monitor = await monitorService.getMonitor(req.user);
  res.status(httpStatus.OK).send(monitor);
});

const updateMonitor = catchAsync(async (req, res) => {
  const updateData = req.body;
  updateData.failCount = 0;
  let monitor = await monitorService.updateMonitorById(req.params.monitorId, updateData);
  if (monitor.isActiveByOwner) {
    updateJob(monitor);
  }
  monitor.status = null;
  res.status(httpStatus.OK).send(monitor);
});

const deleteMonitor = catchAsync(async (req, res) => {
  const monitor = await monitorService.deleteMonitorById(req.params.monitorId);
  stopJob(monitor.id);
  if (monitor.maintanance != null) {
    stopMaintananceTask(monitor.id);
    stopMaintananceJob(monitor.maintanance);
  }
  res.status(httpStatus.OK).send(monitor);
});

const pauseMonitor = catchAsync(async (req, res) => {
  const monitor = await monitorService.updateMonitorById(req.params.monitorId, {
    isActiveByOwner: false,
    status: "uncertain",
  });
  stopJob(monitor.id);
  res.status(httpStatus.OK).send(monitor);
});

const playMonitor = catchAsync(async (req, res) => {
  const monitor = await monitorService.updateMonitorById(req.params.monitorId, { isActiveByOwner: true });
  startJob(monitor);
  res.status(httpStatus.OK).send(monitor);
});

const getMonitorWithLogs = catchAsync(async (req, res) => {
  const monitors = await monitorService.getMonitor(req.user);
  
  if (!monitors) {
    throw new Error('Monitor not found');
  }
  if (monitors.isActiveByOwner) {
    throw new Error('Monitor is active');
  }
  if (monitors.isActiveByOwner === null) {
    throw new Error('Monitor is not active');
  }

  const report= generateReportCollective(monitors);

  res.status(httpStatus.OK).send(report);
});

const getInstantControlMonitor = catchAsync(async (req, res) => {
  const monitors = await monitorService.getMonitor(req.user);
  if (!monitors) {
    throw new Error('Monitor not found');
  }
  const instantControlMonitor = monitors.map((monitor) => {
    return {
      id: monitor.id,
      name: monitor.name,
      host: monitor.host,
      status: monitor.status,
      method: monitor.method,
      body: monitor.body,
      headers: monitor.headers,
      allowedStatusCodes: monitor.allowedStatusCodes,
    };
  })
  res.status(httpStatus.OK).send(instantControlMonitor);
});

const sentRequestInstantControlMonitor = catchAsync(async (req, res) =>  {
  const monitor = await monitorService.getMonitorById(req.params.monitorId, false);
  if (!monitor) {
    throw new Error('Monitor not found');
  }
  const response = await sendRequest(monitor);
  
  res.status(httpStatus.OK).send(response);
});

const getMaintananceMonitor = catchAsync(async (req, res) => {
  let monitors = await monitorService.getMaintenance(req.user);
  if (!monitors) {
    throw new Error('Monitor not found');
  }
  res.status(httpStatus.OK).send(monitors);
});

const createMaintananceMonitor = catchAsync(async (req, res) => {
  let monitor = await monitorService.getMonitorById(req.params.monitorId, true);
  let maintanance=null;
  if (monitor.maintanance) {
    const body = {
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      status: false,
    }
    maintanance = await maintananceService.updateMaintananceById(monitor.maintanance.id, body);
  }
  else{
    maintanance = await maintananceService.createMaintanance(req.params.monitorId, req.body);
  }
  
  if (!maintanance) {
    throw new Error('Maintanance not created');
  }
  startMaintananceTask(maintanance);
  monitor = await monitorService.updateMonitorById(req.params.monitorId, {
    status: "maintanance",
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
   }

  res.status(httpStatus.OK).send(response);
});

const stopMaintanance = catchAsync(async (req, res) => {
   const body = {
    status: false,
   }
   const monitor = await monitorService.getMonitorById(req.params.monitorId, true);
    if (!monitor) {
      throw new Error('Monitor not found');
    }
   const maintananceId = monitor.maintanance.id;
   const maintanance = await maintananceService.updateMaintananceById(maintananceId, body);
   stopMaintananceJob(maintanance);
   await monitorService.updateMonitorById(req.params.monitorId, {
    status: "uncertain",
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
   }
   res.status(httpStatus.OK).send(response);
});

const cancelMaintananceTask = catchAsync(async (req, res) => {
  const monitor = await monitorService.getMonitorById(req.params.monitorId, true);
  if (!monitor) {
    throw new Error('Monitor not found');
  }
  stopMaintananceTask(monitor.id);
  await maintananceService.updateMaintananceById(monitor.maintanance.id, {
    status: false,
  });
  await monitorService.updateMonitorById(req.params.monitorId, {
    status: "uncertain",
  });
  const response = {
    id: monitor.id,
    name: monitor.name,
    host: monitor.host,
    status: monitor.status,
    maintanance: {
      startTime: monitor.maintanance.startTime,
      endTime: monitor.maintanance.endTime,
      status: monitor.maintanance.status,
    },
   }
   res.status(httpStatus.OK).send(response);
});

module.exports = {
  createMonitor,
  getMonitor,
  updateMonitor,
  deleteMonitor,
  pauseMonitor,
  playMonitor,
  getMonitorWithLogs,
  getInstantControlMonitor,
  sentRequestInstantControlMonitor,
  getMaintananceMonitor,
  createMaintananceMonitor,
  stopMaintanance,
  cancelMaintananceTask,
};
