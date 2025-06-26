const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { monitorService, maintananceService } = require('../services');
const { generateReportCollective, generateReport } = require('../Jobs/tasks/reportTask');
const { maintananceTask,
        monitorTask,
        pingTask,
        portTask,
        keyWordTask,
     } = require('../Jobs/tasks/index');
const { renderMonitor } = require('../Jobs/renderMonitor');
const { monitorParser } = require('../Jobs/monitorParser');
const { maintananceJob } = require('../Jobs/maintananceJob');
const { maintananceWorker } = require('../Jobs/maintanaceWorker');
const { reportTaskWorker } = require('../Jobs/reportTaskWorker');
const { reportJobRender } = require('../Jobs/reportJobRender');

monitorService.staytedsInQueue();
reportJobRender();
reportTaskWorker();
renderMonitor();
monitorParser();
maintananceJob();
maintananceWorker();


const createMonitor = catchAsync(async (req, res) => {
  let now = new Date();
  let monitor = await monitorService.createMonitor(req.body, req.user);
  res.status(httpStatus.CREATED).send(monitor);
});

const getMonitor = catchAsync(async (req, res) => {
  const monitors = await monitorService.getMonitor(req.user.id);
  res.status(httpStatus.OK).send(monitors);
});

const getUserMonitors = catchAsync(async (req, res) => {
  const monitors = await monitorService.getMonitor(req.params.userId);
  monitors.map(monitor =>{
    monitor.successRate = generateReport(monitor.logs)?generateReport(monitor.logs).successRate:'0%';
    delete monitor.logs;
  }) 
  res.status(httpStatus.OK).send(monitors);
});

const updateMonitor = catchAsync(async (req, res) => {
  const updateData = req.body;
  let monitor = await monitorService.updateMonitorById(req.params.monitorId, updateData);
  res.status(httpStatus.OK).send(monitor);
});

const deleteMonitor = catchAsync(async (req, res) => {
  const monitor = await monitorService.deleteMonitorById(req.params.id);
  res.status(httpStatus.OK).send(monitor);
});

const pauseMonitor = catchAsync(async (req, res) => {
  const monitor = await monitorService.updateMonitorById(req.params.id, {
    isActiveByOwner: false,
    status: "uncertain",
  });
  res.status(httpStatus.OK).send(monitor);
});

const playMonitor = catchAsync(async (req, res) => {
  const monitor = await monitorService.updateMonitorById(req.params.id, { isActiveByOwner: true });
  res.status(httpStatus.OK).send(monitor);
});

const getMonitorWithLogs = catchAsync(async (req, res) => {
  const monitors = await monitorService.getMonitor(req.user.id);
  if (!monitors) {
    throw new Error('Monitor not found');
  }
  const report= generateReportCollective(monitors);
  res.status(httpStatus.OK).send(report);
});

const getMonitorWithLogsForAdmin = catchAsync(async (req, res) => {
  const monitors = await monitorService.getMonitor(req.params.userId);
  if (!monitors) {
    throw new Error('Monitor not found');
  }
  const report= generateReportCollective(monitors);
  res.status(httpStatus.OK).send(report);
});

const getInstantControlMonitor = catchAsync(async (req, res) => {
  const monitors = await monitorService.getInstantMonitors(req.user);
  if (!monitors) {
    throw new Error('Monitor not found');
  }
  res.status(httpStatus.OK).send(monitors);
});

const sentRequestInstantControlMonitor = catchAsync(async (req, res) =>  {
  const monitor = await monitorService.getInstantControlMonitorById(req.params.id);
  if (!monitor) {
    throw new Error('Monitor not found');
  }
  let response = null;
  switch(monitor.monitorType){
    case'HttpMonitor':{
      response = await monitorTask.sendRequest(monitor.httpMonitor);
      break;
    }
    case'PingMonitor':{
      response = await pingTask.sendPing(monitor.pingMonitor);
      break;
    }
    case'PortMonitor':{
      response = await portTask.controlPort(monitor.portMonitor);
      break;
    }
    case'KeywordMonitor':{
      response = await keyWordTask.sendRequestAndControlKey(monitor.keyWordMonitor);
      break;
    }
    default:{
      response = {
        status: 0,
        responseTime: 0,
        isError: true,
        message: "This monitor not work !",
      };
      break;
    }
  }
  console.log(response)
  res.status(httpStatus.OK).send(response);
});

const getMaintananceMonitor = catchAsync(async (req, res) => {
  let monitors = await monitorService.getMaintenance(req.user.id);
  if (!monitors) {
    throw new Error('Monitor not found');
  }
  res.status(httpStatus.OK).send(monitors);
});

const getAdminMaintananceMonitor = catchAsync(async (req, res) => {
  let monitors = await monitorService.getMaintenance(req.params.userId);
  if (!monitors) {
    throw new Error('Monitor not found');
  }
  res.status(httpStatus.OK).send(monitors);
});

const createMaintananceMonitor = catchAsync(async (req, res) => {
  let monitor = await monitorService.getMonitorById(req.params.id, true);
  let maintanance=null;
  if (monitor.maintanance) {
    if(monitor.maintanance.status){
      await monitorService.updateMonitorById(req.params.id, {
         isProcess: false,
         status: 'uncertain'
      });
    }
    const body = {
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      controlTime: req.body.startTime,
      status: true,
    }
    maintanance = await maintananceService.updateMaintananceById(monitor.maintanance.id, body);
  }
  else{
    maintanance = await maintananceService.createMaintanance(req.params.id, req.body);
  }
  
  if (!maintanance) {
    throw new Error('Maintanance not created');
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
   const monitor = await monitorService.getMonitorById(req.params.id, true);
    if (!monitor) {
      throw new Error('Monitor not found');
    }
   const maintananceId = monitor.maintanance.id;
   const maintanance = await maintananceService.updateMaintananceById(maintananceId, body);
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
  getUserMonitors,
  getAdminMaintananceMonitor,
  getMonitorWithLogsForAdmin,
};
