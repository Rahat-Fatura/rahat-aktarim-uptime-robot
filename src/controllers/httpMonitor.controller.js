const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { httpMonitorService, monitorService } = require('../services');
const { monitorTask } = require('../Jobs/tasks/monitorTask');
const { cronExprension } = require('../Jobs/utils/taskUtils');
const { httpMonitorTask } = require('../Jobs/queuesWorker/httpMonitorTask');

httpMonitorTask();

const createMonitor = catchAsync(async (req, res) => {
  const monitor = await httpMonitorService.createHttpMonitor(req.body,req.user);
  monitorTask(monitor);
  res.status(httpStatus.CREATED).send(monitor);
});

const getMonitor = catchAsync(async (req, res) => {
  const monitor = await httpMonitorService.getHttpMonitorFullDataById(req.params.id);
  res.status(httpStatus.OK).send(monitor);
});

const updateMonitor = catchAsync(async (req, res) => {
  const updateData = req.body;
  let now = new Date();
  let monitorBody = await monitorService.getMonitorById(req.params.id);
  if(updateData.interval === monitorBody.interval && updateData.intervalUnit === monitorBody.intervalUnit){

  }
  else{
      updateData.controlTime = new Date(
        now.getTime() +
        cronExprension(updateData.interval,updateData.intervalUnit)
      ) 
  }

  let monitor = await httpMonitorService.updateHttpMonitorById(req.params.id, updateData);
  res.status(httpStatus.OK).send(monitor);
});

module.exports = {
  createMonitor,
  getMonitor,
  updateMonitor,
};
