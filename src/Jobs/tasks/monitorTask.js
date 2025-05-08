/* eslint-disable prettier/prettier */
/* eslint-disable no-empty */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-destructuring */
/* eslint-disable prettier/prettier */
/* eslint-disable import/order */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
const { monitorService, monitorLogService, emailService } = require('../../services');
const axios = require('axios');
const { cronExprension } = require('../utils/taskUtils');

async function monitorTask(monitor) {
  console.log("Monitor Task Çalışıyor !",monitor.name);
  if (monitor.maintanance && monitor.maintanance.status) {
    return;
  } else {
    const result = await sendRequest(monitor);
    if (!result.isError) {
      if (monitor.status === 'down' || monitor.status === 'uncertain') {
        try {
          await emailService.sendEmail(
            `<${monitor.serverOwner.email}>`,
            `Rahat Sistem Sunucu kontrollörü  ${monitor.method}`,
            `Sunucunuz çalışıyor ...
             HOST ADI: ${monitor.host}
             STATUS CODE: ${result.status}
             Message: ${result.message}`,
          );
        } catch (err) {
          console.log(err);
        }
      }
      monitor.status = 'up';
      monitor.isProcess = false;
      const now = new Date();
      monitor.controlTime = new Date(now.getTime() + cronExprension(monitor.interval, monitor.intervalUnit));
      await monitorLogService.createLog(monitor, result);
      await monitorService.updateMonitorById(monitor.id, {status: monitor.status, isProcess: monitor.isProcess, controlTime: monitor.controlTime});
      // eslint-disable-next-line prettier/prettier, eqeqeq
    } else {
      await emailService.sendEmail(
        `<${monitor.serverOwner.email}>`,
        `Rahat Sistem Sunucu kontrollörü  ${monitor.method}`,
        `Sunucunuz çalışmıyor !!!
         HOST ADI: ${monitor.host}
          STATUS CODE: ${result.status}
          Message: ${result.message}`,
      );
      monitor.isProcess = false;
      monitor.status = 'down';
      const now = new Date();
      monitor.controlTime = new Date(now.getTime() + cronExprension(monitor.interval, monitor.intervalUnit));
      await monitorLogService.createLog(monitor, result);
      await monitorService.updateMonitorById(monitor.id, {status: monitor.status, isProcess: monitor.isProcess, controlTime: monitor.controlTime});
    }
  }
}

async function sendRequest(monitor) {
  const startTime = Date.now();
  let isError = false;
  let status;
  try {
    const config = {
      method: monitor.method,
      url: monitor.host,
      headers: monitor.headers || {},
      timeout: 10000,
    };
    if (['POST', 'PUT', 'PATCH'].includes(monitor.method)) {
      config.data = monitor.body || {};
    }
    const response = await axios(config);
    isError = !monitor.allowedStatusCodes.includes(response.status.toString());
    const responseTime = Date.now() - startTime;
    status = response.status;
    return { status: status, responseTime, isError, message: isError ? 'unsuccess' : 'success' };
  } catch (error) {
    if (error.status) {
      isError = !monitor.allowedStatusCodes.includes(error.status.toString());
      status = error.status;
    } else {
      isError = true;
    }
    //console.log('error', error);
  }
  finally{
    const responseTime = Date.now() - startTime;
    return { status: status || 0, responseTime, isError, message: isError ? 'unsuccess' : 'success' };
  }
}

module.exports = {
  monitorTask,
  sendRequest,
};
