const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { monitorService, tokenService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');


const accessToMonitor =()=>catchAsync(async (req, res, next) => {
  console.log(req.body)
  const monitor = await monitorService.getMonitorById(req.params.id,false);
  if (monitor.userId !== req.user.id) {
    return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
  }
  next();
});

const accessToCronJob =()=>catchAsync(async (req, res, next) => {
  try{
    const token = config.jwt.headerStaticCode+"."+req.params.token;
    const id = tokenService.verifyTokenForHeartBeat(token);  
    req.params.id = id.sub;
    next();
  }
  catch(error){
    next(error)
  }
  
});

module.exports = {
  accessToMonitor,
  accessToCronJob,
};
