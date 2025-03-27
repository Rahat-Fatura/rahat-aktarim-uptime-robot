/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { monitorService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const accessToMonitor =()=>catchAsync(async (req, res, next) => {
  const monitor = await monitorService.getMonitorById(req.params.monitorId,false);
  if (monitor.user_id !== req.user.id) {
    return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
  }
  next();
});

module.exports = {
  accessToMonitor,
};
