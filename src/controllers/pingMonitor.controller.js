const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { pingMonitorService, monitorService } = require('../services');
const { pingMonitorTask } = require('../Jobs/queuesWorker/pingMonitorTask');

pingMonitorTask();

const createMonitor = catchAsync(async (req, res) => {
  const monitor = await pingMonitorService.createPingMonitor(req.body,req.user.id);
  res.status(httpStatus.CREATED).send(monitor);
});

const adminCreateMonitor = catchAsync(async (req, res) => {
  const monitor = await pingMonitorService.createPingMonitor(req.body,req.params.userId);
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
    if(updateData.interval != monitorBody.interval || updateData.intervalUnit != monitorBody.intervalUnit){
        updateData.controlTime = now;
    }
  let monitor = await pingMonitorService.updatePingMonitorById(req.params.id, updateData);
  res.status(httpStatus.OK).send(monitor);
});


module.exports = {
  createMonitor,
  getMonitor,
  updateMonitor,
  adminCreateMonitor,
};
