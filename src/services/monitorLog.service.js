/* eslint-disable no-return-await */
/* eslint-disable camelcase */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const MonitorLog = require('../utils/database').log;

const createLog = async (monitor, result) => {
  await MonitorLog.create({
    data: {
      monitorId: monitor.id,
      statusCode: result.status,
      responseTime: result.responseTime,
      isError: result.isError,
    },
  });
};

const getMonitorLogs = async (user) => {
  const monitorLogs = await MonitorLog.findMany({ where: { server_owner: { id: user.id } } });
  return monitorLogs;
};

async function getLogsByTime(monitorId, report_time, reportTimeUnits) {
  const now = new Date();
  // eslint-disable-next-line prefer-const
  let pastDate = new Date(now);

  // Kullanıcının belirttiği süreyi hesapla
  switch (reportTimeUnits) {
    case 'months':
      pastDate.setMonth(now.getMonth() - report_time);
      break;
    case 'hours':
      pastDate.setHours(now.getHours() - report_time);
      break;
    case 'days':
      pastDate.setDate(now.getDate() - report_time);
      break;
    case 'weeks':
      pastDate.setMinutes(now.getMinutes() - report_time);
      break;
    default:
      throw new Error('Geçersiz zaman birimi!');
  }

  const logs = await MonitorLog.findMany({
    where: {
      monitorId,
      createdAt: { gte: pastDate },
    },
    orderBy: { createdAt: 'desc' },
  });

  await MonitorLog.deleteMany({});

  return logs;
}
module.exports = {
  createLog,
  getMonitorLogs,
  getLogsByTime,
};
