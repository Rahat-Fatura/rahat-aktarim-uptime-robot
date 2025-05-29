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

async function getLogsByTime(monitorId, reportTime, reportTimeUnits) {
  const now = new Date();
  // eslint-disable-next-line prefer-const
  let pastDate = new Date(now);

  // Kullanıcının belirttiği süreyi hesapla
  switch (reportTimeUnits) {
    case 'months':
      pastDate.setMonth(now.getMonth() - reportTime);
      break;
    case 'hours':
      pastDate.setHours(now.getHours() - reportTime);
      break;
    case 'days':
      pastDate.setDate(now.getDate() - reportTime);
      break;
    case 'weeks':
      pastDate.setMinutes(now.getMinutes() - reportTime);
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
