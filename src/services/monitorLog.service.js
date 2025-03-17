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

async function getLogsLast24Hours(monitorId) {
  const lastDay = new Date();
  lastDay.setDate(lastDay.getDate() - 1); // 24 saat öncesi

  // eslint-disable-next-line no-return-await
  return await MonitorLog.findMany({
    where: {
      monitorId,
      createdAt: { gte: lastDay }, // createdAt >= lastDay
    },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = {
  createLog,
  getMonitorLogs,
  getLogsLast24Hours,
};
