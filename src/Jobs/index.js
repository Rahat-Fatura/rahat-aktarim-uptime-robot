/* eslint-disable prettier/prettier */
/* eslint-disable array-callback-return */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable import/newline-after-import */
/* eslint-disable import/order */
const { monitorTask, cronExprension } = require('./monitorTask');
const { reportTask, reportExprension } = require('./reportTask');
const cron = require('node-cron');
let jobs = {};
let reportJobs = {};

function startJob(monitor) {
  try {
    monitorTask(monitor);
    jobs[monitor.id] = cron.schedule(cronExprension(monitor.interval, monitor.intervalUnit),()=> monitorTask(monitor), {
      scheduled: true,
    });
    reportJobs[monitor.id] = cron.schedule(reportExprension(monitor.report_time, monitor.reportTimeUnit),()=> reportTask(monitor), {  
      scheduled: true,
    });
  } catch (error) {
    console.log(` Hata: ${error}`);
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

module.exports = {
  startJob,
  updateJob,
  stopJob,
  renderJobs,
};
