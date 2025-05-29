const monitorService = require("./").monitorService;
const CronJobMonitor = require("../utils/database").cronJobMonitor;
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const config = require("../config/config");
const {
  generateTokenForHeartBeat,
  verifyTokenForHeartBeat,
} = require("./token.service");
const { cronExprension } = require("../Jobs/utils/taskUtils");

const createCronJobMonitor = async (monitorBody, user) => {
  let controlTime;
  let cronJobMonitor;
  let monitor;
  const body = {
    name: monitorBody.name,
    monitorType: "CronJobMonitor",
    interval: monitorBody.interval,
    intervalUnit: monitorBody.intervalUnit,
  };
  try {
    monitor = await monitorService.createMonitor(body, user);
    controlTime = new Date(
      monitor.controlTime.getTime() +
        cronExprension(monitorBody.cronJobMonitor.devitionTime, "minutes")
    );
    await monitorService.updateMonitorById(monitor.id, {
      controlTime: controlTime,
    });
    const token = generateTokenForHeartBeat(monitor.id);
    const devToken = token.split(".")[1] + "." + token.split(".")[2];
    const url = `${config.app.heartbeatUrl}` + devToken;
    cronJobMonitor = await CronJobMonitor.create({
      data: {
        id: monitor.id,
        host: url,
        token: token,
        devitionTime: monitorBody.cronJobMonitor.devitionTime,
        userId: user.id,
      },
    });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "host adres daha önce alınmış");
    console.log(error);
  }

  return cronJobMonitor;
};

const getCronJobMonitorById = async (id) => {
  let monitor;
  try {
    monitor = await CronJobMonitor.findUnique({
      where: {
        id: Number(id),
      },
    });
  } catch (error) {
    console.log(error);
  }
  return monitor;
};

const updateCronJobMonitorById = async (id, updateData) => {
  const cronJobBody = updateData.cronJobMonitor;
  delete updateData.cronJobMonitor;
  const monitorBody = updateData;
  let cronJobMonitor = await getCronJobMonitorById(id);
  if (!cronJobMonitor) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Http Monitor can not find !");
  }
  try {
    await monitorService.updateMonitorById(id, monitorBody);
    cronJobMonitor = await CronJobMonitor.update({
      where: { id: Number(id) },
      data: cronJobBody,
    });
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, "Unsuccess update Monitor !");
  }
  return cronJobMonitor;
};

const cronJobMonitorHeartBeat = async (id, date) => {
  let cronJobMonitor;
  try {
    cronJobMonitor = await CronJobMonitor.update({
      where: { id: Number(id) },
      data: {
        lastRequestTime: date,
      },
    });
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus[400], "Error");
  }
  return cronJobMonitor;
};

const getCronJobMonitorFullDataById = async(id) =>{
  let monitor;
   try{
      monitor = await CronJobMonitor.findUnique({ where:{
        id: Number(id)
      },
      select: {
        devitionTime: true,
        monitor: {
          select: {
            name: true,
            interval: true,
            intervalUnit: true,
            notifications: {
              select: {
                emails: true,
              }
            },
          }
        },
      }
     })
   }
   catch(error){
    console.log(error)
   }
   console.log(monitor)
   return monitor;
}

module.exports = {
  createCronJobMonitor,
  updateCronJobMonitorById,
  getCronJobMonitorById,
  cronJobMonitorHeartBeat,
  getCronJobMonitorFullDataById
};
