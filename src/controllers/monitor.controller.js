/* eslint-disable array-callback-return */
/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable no-const-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable import/order */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-vars */
/* eslint-disable import/newline-after-import */
/* eslint-disable prefer-const */
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { monitorService, monitorLogService, emailService } = require('../services');
const cron = require('node-cron');
const axios = require('axios');

let jobs = {};

async function renderJobs() {
  console.log('RENDER ÇALIŞIYOR');
  const monitors = await monitorService.runJob();
  monitors.map((monitor) => {
    console.log(monitor.interval);
    startJob(monitor.id, monitor.interval, () => task(monitor));
  });
}

renderJobs();

async function task(monitor) {
  console.log(monitor.host, ' RUUUNNNIIIIGGG !!!!');
  const controlMonitor = await monitorService.getMonitorById(monitor.id, true);
  const user = controlMonitor.server_owner;
  const result = await sendRequest(monitor);
  if (!result.isError) {
    if (!controlMonitor.status || controlMonitor.status == null) {
      await emailService.sendEmail(
        `<${user.email}>`,
        `Rahat Sistem Sunucu kontrollörü  ${monitor.method}`,
        `Sunucunuz çalışıyor ...
         HOST ADI: ${monitor.host}
         STATUS CODE: ${result.status}
         Message: ${result.message}`,
      );
      monitor.status = true;
      monitor.is_process = true;
      await monitorLogService.createLog(monitor, result);
      await monitorService.updateMonitorById(monitor.id, monitor);
    }
    monitor.status = true;
    monitor.is_process = true;
    await monitorLogService.createLog(monitor, result);
    await monitorService.updateMonitorById(monitor.id, monitor);
    // eslint-disable-next-line prettier/prettier
  } 
  else {
    await emailService.sendEmail(
      `<${user.email}>`,
      `Rahat Sistem Sunucu kontrollörü  ${monitor.method}`,
      `Sunucunuz çalışmıyor !!!
       HOST ADI: ${monitor.host}
       STATUS CODE: ${result.status}
       Message: ${result.message}`,
    );
    monitor.is_process = true;
    monitor.status = false;
    await monitorLogService.createLog(monitor, result);
    await monitorService.updateMonitorById(monitor.id, monitor);
  }
}

async function sendRequest(monitor) {
  const startTime = Date.now();
  try {
    const config = {
      method: monitor.method,
      url: monitor.host,
      headers: monitor.headers || {},
      timeout: 30000,
    };
    if (['POST', 'PUT', 'PATCH'].includes(monitor.method)) {
      config.data = monitor.body || {};
    }
    const response = await axios(config);
    const isError = !monitor.allowedStatusCodes.includes(response.status.toString());
    const responseTime = Date.now() - startTime;
    return { status: response.status, responseTime, isError, message: 'success' };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return { status: 0, responseTime, isError: true, message: error };
  }
}

function startJob(monitorId, cronExpression, taskFunction) {
  jobs[monitorId] = cron.schedule('0 * * * * *', taskFunction, { scheduled: true });
  console.log(`🚀 Yeni job başlatıldı: ${monitorId} -> ${cronExpression}`);
}

function updateJob(monitorId, cronExpression, taskFunction) {
  // Eğer aynı userId için bir cron job zaten varsa, önce iptal et
  if (jobs[monitorId]) {
    jobs[monitorId].stop();
    console.log(`✅ Eski job durduruldu: ${monitorId}`);
  }

  // Yeni cron job oluştur ve kaydet
  jobs[monitorId] = cron.schedule(cronExpression, taskFunction, { scheduled: true });
  console.log(`🚀 Yeni job başlatıldı: ${monitorId} -> ${cronExpression}`);
}

function stopJob(monitorId) {
  if (jobs[monitorId]) {
    jobs[monitorId].stop();
    delete jobs[monitorId];
    console.log(`⛔ Job durduruldu: ${monitorId}`);
  } else {
    console.log(`⚠️ Durdurulacak job bulunamadı: ${monitorId}`);
  }
}

const createMonitor = catchAsync(async (req, res) => {
  let monitor = await monitorService.createMonitor(req.body, req.user);
  if (monitor) {
    startJob(monitor.id, '*/10 * * * * *', () => task(monitor));
  }
  res.status(httpStatus.CREATED).send(monitor);
});

const getMonitor = catchAsync(async (req, res) => {
  const monitor = await monitorService.getMonitor(req.user);
  res.status(httpStatus.OK).send(monitor);
});

const updateMonitor = catchAsync(async (req, res) => {
  let monitor = await monitorService.updateMonitorById(req.params.monitorId, req.body);
  if (monitor) {
    updateJob(monitor.id, '*/20 * * * *', () => task(monitor));
  }
  res.status(httpStatus.OK).send(monitor);
});

const deleteMonitor = catchAsync(async (req, res) => {
  const monitor = await monitorService.deleteMonitorById(req.params.monitorId);
  stopJob(monitor.id);
  res.status(httpStatus.OK).send(monitor);
});

const pauseMonitor = catchAsync(async (req, res) => {
  const monitor = await monitorService.updateMonitorById(req.params.monitorId, { is_active_by_owner: false, status: false });
  stopJob(monitor.id);
  res.status(httpStatus.OK).send(monitor);
});

const playMonitor = catchAsync(async (req, res) => {
  const monitor = await monitorService.updateMonitorById(req.params.monitorId, { is_active_by_owner: true, status: true });
  startJob(monitor.id, monitor.method, () => task(monitor));
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
