/* eslint-disable prefer-const */
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { monitorService } = require('../services');
const { startJob, updateJob, stopJob, renderJobs } = require('../Jobs/index');

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
  if (monitor.is_active_by_owner) {
    updateJob(monitor);
  }
  monitor.status = null;
  res.status(httpStatus.OK).send(monitor);
});

const deleteMonitor = catchAsync(async (req, res) => {
  const monitor = await monitorService.deleteMonitorById(req.params.monitorId);
  stopJob(monitor.id);
  res.status(httpStatus.OK).send(monitor);
});

const pauseMonitor = catchAsync(async (req, res) => {
  const monitor = await monitorService.updateMonitorById(req.params.monitorId, {
    is_active_by_owner: false,
    status: null,
  });
  stopJob(monitor.id);
  res.status(httpStatus.OK).send(monitor);
});

const playMonitor = catchAsync(async (req, res) => {
  const monitor = await monitorService.updateMonitorById(req.params.monitorId, { is_active_by_owner: true, failCount: 0 });
  startJob(monitor);
  res.status(httpStatus.OK).send(monitor);
});

module.exports = {
  createMonitor,
  getMonitor,
  updateMonitor,
  deleteMonitor,
  pauseMonitor,
  playMonitor,
};
