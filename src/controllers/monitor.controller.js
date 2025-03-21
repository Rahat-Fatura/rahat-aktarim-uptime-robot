/* eslint-disable spaced-comment */
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
    startJob(monitor, () => task(monitor));
  });
}

renderJobs();

async function task(monitor) {
  console.log(monitor.host, ' RUUUNNNIIIIGGG !!!!  ', monitorService.cronExprension(monitor.interval, monitor.intervalUnit));
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
    }
    monitor.status = true;
    monitor.is_process = true;
    monitor.failCount = 0;
    await monitorLogService.createLog(monitor, result);
    await monitorService.updateMonitorById(monitor.id, monitor);
    // eslint-disable-next-line prettier/prettier, eqeqeq
  } else {
    monitor.failCount += 1;
    // eslint-disable-next-line no-lonely-if, eqeqeq
    if (monitor.failCount == 5) {
      stopJob(monitor.id);
      await emailService.sendEmail(
        `<${user.email}>`,
        `Rahat Sistem Sunucu kontrollörü  ${monitor.method}`,
        `Sunucunuzdan yanıt alamadığız için sunucunuzun işlemi durdurulmuştur. 
         Tekrardan işleme almak için günceleyin veya silip yeniden ekleyin !
         HOST ADI: ${monitor.host}
         STATUS CODE: ${result.status}
         Message: ${result.message}`,
      );
      monitor.is_process = false;
      monitor.status = false;
      monitor.is_active_by_owner = false;
      await monitorLogService.createLog(monitor, result);
      await monitorService.updateMonitorById(monitor.id, monitor);
    } else {
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

function startJob(monitor, taskFunction) {
  console.log(typeof monitor.interval);
  jobs[monitor.id] = cron.schedule(monitorService.cronExprension(monitor.interval, monitor.intervalUnit), taskFunction, {
    scheduled: true,
  });
  console.log(` Yeni job başlatıldı: ${monitor.id}`);
}

function updateJob(monitor, taskFunction) {
  if (jobs[monitor.id]) {
    jobs[monitor.id].stop();
    console.log(` Eski job durduruldu: ${monitor.id}`);
  }
  jobs[monitor.id] = cron.schedule(monitorService.cronExprension(monitor.interval, monitor.intervalUnit), taskFunction, {
    scheduled: true,
  });
  console.log(` Yeni job başlatıldı: ${monitor.id}`);
}

function stopJob(monitorId) {
  if (jobs[monitorId]) {
    jobs[monitorId].stop();
    delete jobs[monitorId];
    console.log(` Job durduruldu: ${monitorId}`);
  } else {
    console.log(` Durdurulacak job bulunamadı: ${monitorId}`);
  }
}

const createMonitor = catchAsync(async (req, res) => {
  let monitor = await monitorService.createMonitor(req.body, req.user);
  if (monitor) {
    await task(monitor);
    startJob(monitor, () => task(monitor));
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
    updateJob(monitor, () => task(monitor));
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
  task(monitor);
  startJob(monitor, () => task(monitor));
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
