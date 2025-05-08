const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { monitorService, maintananceService } = require('../services');
const { generateReportCollective } = require('../Jobs/tasks/reportTask');
const { sendRequest, monitorTask } = require('../Jobs/tasks/monitorTask');
const { webServerMonitoring } = require('../Jobs/webServerMonitoring');
const { maintananceJob } = require('../Jobs/maintananceJob');
const { webServerJob } = require('../Jobs/webServerJob');

webServerMonitoring();
maintananceJob().start();
webServerJob();
webServerJob();

const createMonitor = catchAsync(async (req, res) => {
  let monitor = await monitorService.createMonitor(req.body, req.user);
  monitorTask(monitor);
  res.status(httpStatus.CREATED).send(monitor);
});

const getMonitor = catchAsync(async (req, res) => {
  const monitor = await monitorService.getMonitor(req.user);
  res.status(httpStatus.OK).send(monitor);
});

const updateMonitor = catchAsync(async (req, res) => {
  const updateData = req.body;
  let monitor = await monitorService.updateMonitorById(req.params.monitorId, updateData);
  res.status(httpStatus.OK).send(monitor);
});


const deleteMonitor = catchAsync(async (req, res) => {
  const monitor = await monitorService.deleteMonitorById(req.params.monitorId);
  res.status(httpStatus.OK).send(monitor);
});

const pauseMonitor = catchAsync(async (req, res) => {
  const monitor = await monitorService.updateMonitorById(req.params.monitorId, {
    isActiveByOwner: false,
    status: "uncertain",
  });
  res.status(httpStatus.OK).send(monitor);
});

const playMonitor = catchAsync(async (req, res) => {
  const monitor = await monitorService.updateMonitorById(req.params.monitorId, { isActiveByOwner: true });
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
      controlTime: req.body.startTime,
      status: true,
    }
    maintanance = await maintananceService.updateMaintananceById(monitor.maintanance.id, body);
  }
  else{
    maintanance = await maintananceService.createMaintanance(req.params.monitorId, req.body);
  }
  
  if (!maintanance) {
    throw new Error('Maintanance not created');
  }

  monitor = await monitorService.getMonitorById(maintanance.monitorId, false);
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
    startTime: new Date(),
    endTime: new Date(),
    controlTime: new Date(),
    status: false,
   }
   const monitor = await monitorService.getMonitorById(req.params.monitorId, true);
    if (!monitor) {
      throw new Error('Monitor not found');
    }
   const maintananceId = monitor.maintanance.id;
   const maintanance = await maintananceService.updateMaintananceById(maintananceId, body);
   await monitorService.updateMonitorById(req.params.monitorId, {
    status: "uncertain",
    isProcess: true,
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
};
