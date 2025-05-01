/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
/* eslint-disable prettier/prettier */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable array-callback-return */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable import/newline-after-import */
/* eslint-disable import/order */
const { monitorTask } = require('./tasks/monitorTask');
const { reportTask } = require('./tasks/reportTask');
const { maintananceTask } = require('./tasks/maintananceTask');
const { cronExprension, isoToCron } = require('./utils/taskUtils');
const cron = require('node-cron');
const { monitorService, maintananceService } = require('../services');
let jobs = {};
let reportJobs = {};
let maintananceJobs = {};
let maintananceTasks = {};

function startJob(monitor) {
  try {
    monitorTask(monitor);
    console.log(` Job başlatıldı: ${monitor.name}  `,cronExprension(monitor.interval, monitor.intervalUnit));
    jobs[monitor.id] = cron.schedule(cronExprension(monitor.interval, monitor.intervalUnit),()=> monitorTask(monitor), {
      scheduled: true,
    });
    reportJobs[monitor.id] = cron.schedule(cronExprension(monitor.reportTime, monitor.reportTimeUnit),()=> reportTask(monitor), {  
      scheduled: true,
    });
    console.log(` Job başlatıldı: ${monitor.id}`);
  } catch (error) {
    console.log(` Hata: ${error}`);
  }
}

function startMaintananceTask(maintanance) {
  console.log('startMaintananceTask fonksiyona girdi');
  try{
    maintananceTasks[maintanance.monitorId] = cron.schedule(isoToCron(maintanance.startTime),async ()=>{
        await monitorService.updateMonitorById(maintanance.monitorId, {
          status: "maintanance",
        });
        await maintananceService.updateMaintananceById(maintanance.id, {
          status: true,
        });
        startMaintananceJob(maintanance);
        console.log(`task başlatıldı: ${maintanance.monitorId} ve durduruldu`);
        maintananceTasks[maintanance.monitorId].stop();
        delete maintananceTasks[maintanance.monitorId];
        console.log(`task id ${maintanance.monitorId} buraya geldiğini kontrol ettim`);
      },
      {
        scheduled: true,
      });
  }
  catch(err){
    console.log(err);
  } 
}

function startMaintananceJob(maintanance) {
  console.log('startMaintananceJob fonksiyona girdi');
  maintananceJobs[maintanance.id] = cron.schedule(isoToCron(maintanance.endTime),async ()=>{
      await monitorService.updateMonitorById(maintanance.monitorId, {
        status: "uncertain",
      });
      await maintananceService.updateMaintananceById(maintanance.id, {
        status: false,
      });
      console.log(`Maintanance başlatıldı: ${maintanance.id} ve durduruldu`);
      maintananceJobs[maintanance.id].stop();
      delete maintananceJobs[maintanance.id];
      console.log(`Maintanance id ${maintanance.id} buraya geldiğini kontrol ettim`);
      
  },{
    scheduled: true,
  });
}

function stopMaintananceTask(monitorId) {
  if (maintananceTasks[monitorId]) {
    maintananceTasks[monitorId].stop();
    delete maintananceTasks[monitorId];
    console.log(` Task durduruldu: ${monitorId}`);
  } else {
    console.log(` Durdurulacak Task bulunamadı: ${monitorId}`);
  }
}

function stopMaintananceJob(maintanance) {
  if (maintananceJobs[maintanance.id]) {
    maintananceJobs[maintanance.id].stop();
    delete maintananceJobs[maintanance.id];
    console.log(` Bakım durduruldu: ${maintanance.id}`);
  } else {
    console.log(` Durdurulacak bakım bulunamadı: ${maintanance.id}`);
  }
}

function updateJob(monitor) {
  if (jobs[monitor.id]) {
    jobs[monitor.id].stop();
    reportJobs[monitor.id].stop();
    console.log(` Eski job durduruldu: ${monitor.id}`);
  }
  startJob(monitor);
}

function stopJob(monitorId) {
  if (jobs[monitorId]) {
    jobs[monitorId].stop();
    delete jobs[monitorId];
    reportJobs[monitorId].stop();
    delete reportJobs[monitorId];
    console.log(` Job durduruldu: ${monitorId}`);
  } else {
    console.log(` Durdurulacak job bulunamadı: ${monitorId}`);
  }
}

async function renderJobs(monitorService) {
  console.log('RENDER ÇALIŞIYOR');
  const monitors = await monitorService.runJob();
  monitors.map((monitor) => {
    startJob(monitor);
  });
}

async function renderMaintananceJobs(maintananceService) {
  console.log('RENDER MAINTANANCE ÇALIŞIYOR');
  const maintanances = await maintananceService.runMaintananceJob();
  maintanances.map((maintanance) => {
    startMaintananceJob(maintanance);
  });
}

async function renderMaintananceTasks(maintananceService) {
  console.log('RENDER TASKS ÇALIŞIYOR');
  const maintanances = await maintananceService.runMaintananceTask();
  maintanances.map((maintanance) => {
    startMaintananceTask(maintanance);
  });
}

module.exports = {
  startJob,
  updateJob,
  stopJob,
  renderJobs,
  startMaintananceJob,
  stopMaintananceJob,
  stopMaintananceTask,
  startMaintananceTask,
  renderMaintananceJobs,
  renderMaintananceTasks,
};
