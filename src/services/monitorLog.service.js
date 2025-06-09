const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const MonitorLog = require('../utils/database').log;

const createLog = async (monitor, result) => {
  await MonitorLog.create({
    data: {
      monitorId: monitor.id,
      status: monitor.status,
      responseTime: result.responseTime || 0,
      isError: result.isError,
    },
  });
};

const getMonitorLogs = async (user) => {
  const monitorLogs = await MonitorLog.findMany({ where: { serverOwner: { id: user.id } } });
  return monitorLogs;
};

async function getLogsByTime(monitorId) {
  const logs = await MonitorLog.findMany({
    where: {
      monitorId: monitorId,
    },
    orderBy: { createdAt: 'desc' },
  });

  await MonitorLog.deleteMany({
    where: {
      monitorId: monitorId
    }
  });

  return logs;
}
module.exports = {
  createLog,
  getMonitorLogs,
  getLogsByTime,
};
