const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { portMonitorService, monitorService } = require('../services');
const { cronExprension } = require('../Jobs/utils/taskUtils');
const { portMonitorTask } = require('../Jobs/queuesWorker/portMonitorTask');
const { portTask } = require('../Jobs/tasks/portTask');
portMonitorTask();

const createMonitor = catchAsync(async (req, res) => {
  const monitor = await portMonitorService.createPortMonitor(req.body,req.user.id);
  portTask(monitor);
  res.status(httpStatus.CREATED).send(monitor);
});

const adminCreateMonitor = catchAsync(async (req, res) => {
  const monitor = await portMonitorService.createPortMonitor(req.body,req.params.userId);
  portTask(monitor);
  res.status(httpStatus.CREATED).send(monitor);
});

const getMonitor = catchAsync(async (req, res) => {
  const monitor = await portMonitorService.getPortMonitorFullDataById(req.params.id);
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
  let monitor = await portMonitorService.updatePortMonitorById(req.params.id, updateData);
  res.status(httpStatus.OK).send(monitor);
});



module.exports = { 
  createMonitor,
  getMonitor,
  updateMonitor,
  adminCreateMonitor,
};
