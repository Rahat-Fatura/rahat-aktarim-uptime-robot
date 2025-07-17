const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { monitorService } = require('../services');
const { generateReportCollective, generateReport } = require('../Jobs/tasks/reportTask');
const {
        monitorTask,
        pingTask,
        portTask,
        keyWordTask,
     } = require('../Jobs/tasks/index');
const { renderMonitor } = require('../Jobs/renderMonitor');
const { monitorParser } = require('../Jobs/monitorParser');
const { reportTaskWorker } = require('../Jobs/reportTaskWorker');
const { reportJobRender } = require('../Jobs/reportJobRender');

monitorService.staytedsInQueue();
reportJobRender();
reportTaskWorker();
renderMonitor();
monitorParser();

const createMonitor = catchAsync(async (req, res) => {
  let now = new Date();
  let monitor = await monitorService.createMonitor(req.body, req.user);
  res.status(httpStatus.CREATED).send(monitor);
});

const getMonitor = catchAsync(async (req, res) => {
  const monitors = await monitorService.getMonitor(req.user.id);
  res.status(httpStatus.OK).send(monitors);
});

const getMonitorById = catchAsync(async (req, res) => {
  const monitor = await monitorService.getMonitorByIdWithLogs(req.params.id);
  res.status(httpStatus.OK).send(monitor);
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

const deleteMonitors = catchAsync(async (req, res) => {
  const monitor = await monitorService.deleteMonitorsByIds(req.body.ids);
  res.status(httpStatus.OK).send();
});

const pauseMonitors = catchAsync(async (req, res) => {
  const monitors = await monitorService.updateMonitorsByIds(req.body.ids,{ isActiveByOwner: false, status: 'uncertain'});
  res.status(httpStatus.OK).send();
});

const playMonitors = catchAsync(async (req, res) => {
  const monitors = await monitorService.updateMonitorsByIds(req.body.ids,{ isActiveByOwner: true});
  res.status(httpStatus.OK).send();
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


module.exports = {
  createMonitor,
  getMonitor,
  getMonitorById,
  updateMonitor,
  deleteMonitor,
  pauseMonitor,
  playMonitor,
  getMonitorWithLogs,
  getInstantControlMonitor,
  sentRequestInstantControlMonitor,
  getUserMonitors,
  getMonitorWithLogsForAdmin,
  deleteMonitors,
  pauseMonitors,
  playMonitors,
};
