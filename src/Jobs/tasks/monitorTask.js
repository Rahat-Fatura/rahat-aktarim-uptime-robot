/* eslint-disable prettier/prettier */
/* eslint-disable import/order */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
const { monitorService, monitorLogService, emailService } = require('../../services');
const axios = require('axios');

async function monitorTask(monitor) {
  const controlMonitor = await monitorService.getMonitorById(monitor.id, true);
  const user = controlMonitor.server_owner;
  const result = await sendRequest(monitor);
  if (!result.isError) {
    if (!controlMonitor.status || controlMonitor.status == null) {
      try{
        await emailService.sendEmail(
          `<${user.email}>`,
          `Rahat Sistem Sunucu kontrollörü  ${monitor.method}`,
          `Sunucunuz çalışıyor ...
             HOST ADI: ${monitor.host}
             STATUS CODE: ${result.status}
             Message: ${result.message}`,
        );
      }
      catch(err){
        console.log(err);
      }
    }
    monitor.status = true;
    monitor.is_process = true;
    monitor.failCount = 0;
    await monitorLogService.createLog(monitor, result);
    await monitorService.updateMonitorById(monitor.id, monitor);
    // eslint-disable-next-line prettier/prettier, eqeqeq
  } else {
    monitor.failCount += 1;
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
  let isError = false;
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
    isError = !monitor.allowedStatusCodes.includes(response.status.toString());
    const responseTime = Date.now() - startTime;
    return { status: response.status, responseTime, isError, message: isError ? 'unsuccess' : 'success' };
  } catch (error) {
    if(error.status){
      isError = !monitor.allowedStatusCodes.includes(error.status.toString());
    }
    else{
      isError = true;
    }
    const responseTime = Date.now() - startTime;
    return { status: error.status || 0, responseTime, isError, message: isError ? 'unsuccess' : 'success' };
  }
}

module.exports = {
  monitorTask,
}


