const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { pingMonitorService, monitorService } = require('../services');
const { pingTask } = require('../Jobs/tasks/pingTask');
const { cronExprension } = require('../Jobs/utils/taskUtils');
const { pingMonitorTask } = require('../Jobs/queuesWorker/pingMonitorTask');

pingMonitorTask();

const createMonitor = catchAsync(async (req, res) => {
  const monitor = await pingMonitorService.createPingMonitor(req.body,req.user);
  pingTask(monitor);
  res.status(httpStatus.CREATED).send(monitor);
});

const getMonitor = catchAsync(async (req, res) => {
  const monitor = await pingMonitorService.getPingMonitorFullDataById(req.params.id);
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
  let monitor = await pingMonitorService.updatePingMonitorById(req.params.id, updateData);
  res.status(httpStatus.OK).send(monitor);
});


module.exports = {
  createMonitor,
  getMonitor,
  updateMonitor,
};
