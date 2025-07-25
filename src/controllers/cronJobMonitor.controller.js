const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { cronJobMonitorService, monitorService } = require('../services');
const { cronExprension } = require('../Jobs/utils/taskUtils');
const { controlRequestTime } = require('../Jobs/tasks/cronJobTask');
const { cronJobMonitorTask } = require('../Jobs/queuesWorker/cronJobMonitorTask');

cronJobMonitorTask();

const createMonitor = catchAsync(async (req, res) => {
  const monitor = await cronJobMonitorService.createCronJobMonitor(req.body,req.user.id);
  res.status(httpStatus.CREATED).send(monitor);
});

const adminCreateMonitor = catchAsync(async (req, res) => {
  const monitor = await cronJobMonitorService.createCronJobMonitor(req.body,req.params.userId);
  res.status(httpStatus.CREATED).send(monitor);
});


const getMonitor = catchAsync(async (req, res) => {
  const monitor = await cronJobMonitorService.getCronJobMonitorFullDataById(req.params.id);
  res.status(httpStatus.OK).send(monitor);
});

const updateMonitor = catchAsync(async (req, res) => {
  const now = new Date();
  let updateData = req.body;
  const monitorBody = await monitorService.getMonitorById(req.params.id);
  let monitor = await cronJobMonitorService.getCronJobMonitorById(req.params.id);
  if (!monitorBody || !monitor) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Monitor not found' });
  }
  if(updateData.interval === monitorBody.interval && updateData.intervalUnit === monitorBody.intervalUnit){
    if(updateData.cronJobMonitor.devitionTime!== monitor.devitionTime){
      updateData.controlTime = new Date(
        monitorBody.controlTime.getTime() -
        cronExprension(monitor.devitionTime, "minutes") +
        cronExprension(updateData.cronJobMonitor.devitionTime,"minutes") 
      )
    }
  }else{
    if(updateData.cronJobMonitor.devitionTime !== monitor.devitionTime){
      updateData.controlTime = new Date(
        now.getTime() +
        cronExprension(updateData.interval,updateData.intervalUnit) +
        cronExprension(updateData.cronJobMonitor.devitionTime,"minutes")
      )
    }else{
      updateData.controlTime = new Date( 
      now.getTime() +
      cronExprension(updateData.interval,updateData.intervalUnit) +
      cronExprension(monitor.devitionTime,"minutes")
    )
    }
  }
  monitor = await cronJobMonitorService.updateCronJobMonitorById(req.params.id, updateData);
  res.status(httpStatus.OK).send(monitor);
});

const cronJobMonitor = catchAsync(async (req, res) => {
    let now = new Date();
    let data;
    console.log("cronJobMonitor",req.params.id);
    let monitor = await cronJobMonitorService.getCronJobMonitorById(req.params.id);
    const monitorBody = await monitorService.getMonitorById(req.params.id);
    if (!monitor || !monitorBody) {
        return res.status(httpStatus.NOT_FOUND).send({ message: 'Monitor not found' });
    }
    if( monitor.lastRequestTime === null || monitor.lastRequestTime === undefined){
        monitor.lastRequestTime = now;
        let controlTime = new Date(now.getTime() + cronExprension(monitorBody.interval, monitorBody.intervalUnit) + cronExprension(monitor.devitionTime, "minutes"));
        await monitorService.updateMonitorById(monitor.id, {
            controlTime: controlTime,
            isProcess: false
        });
    }
    monitor = await cronJobMonitorService.cronJobMonitorHeartBeat(monitor.id, now);
    data = controlRequestTime(monitor, monitorBody.controlTime);
    
   res.status(httpStatus.OK).send(data); 
});

module.exports = {
  createMonitor,
  getMonitor,
  updateMonitor,
  cronJobMonitor,
  adminCreateMonitor,
};
