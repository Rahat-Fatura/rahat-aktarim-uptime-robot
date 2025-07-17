const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { monitorService, tokenService, userService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');


const accessToMonitor =()=>catchAsync(async (req, res, next) => {
  const monitor = await monitorService.getMonitorById(req.params.id,false);
  const user= await userService.getUserById(req.user.id);
  if (monitor.userId == user.id || user.role == 'admin') {
    next();
  }
  else{
    return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
  }
});

const accessToMonitors =()=>catchAsync(async (req, res, next) => {
  let flag = false;
  const monitorsId = await monitorService.getMonitorsOnlyId(req.user.id);
  console.log(req.body)
  const reqMonitorsId = req.body.ids;
  console.log("Kullanıcı Server ids: ",monitorsId);
  console.log("Kullanıcı send Ids :", reqMonitorsId)
  for (let index = 0; index < reqMonitorsId.length; index++) {
    flag = monitorsId.includes(reqMonitorsId[index]);
    if(flag){
      flag=true
    }
    else{
      flag=false;
      break;
    }
  }
  if(flag){
    next();
  }
  else{
    return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
  }
  
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
  accessToMonitors
};
