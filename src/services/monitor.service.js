/* eslint-disable prettier/prettier */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
/* eslint-disable no-console */
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const Monitor = require('../utils/database').monitor;

/**
 * Create a user
 * @param {Object} monitorBody
 * @returns {Promise<User>}
 */
const createMonitor = async (monitorBody, user) => {
  if (await Monitor.findFirst({ where: { user_id: user.id, host: monitorBody.host } })) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'host adres daha önce alınmış');
  }
  const monitorData = Object.assign(monitorBody, { server_owner: { connect: { id: user.id } } });
  const monitor = await Monitor.create({ data: monitorData }); 
  return monitor;
};

const getMonitor = async (user) => {
  let monitor;
  if (user.role == 'admin') {
    monitor = await Monitor.findMany({ include: { logs: true } });
  } else {
    monitor = await Monitor.findMany({ where: { server_owner: { id: user.id } }, include: { logs: true } });
  }
  return monitor;
};

const runJob = async () => {
  const monitors = await Monitor.findMany({
    where: {
      is_active_by_owner: true,
      is_process: true,
    },
  });
  return monitors;
};

const getMonitorById = async (id, flag) => {
  const monitor = await Monitor.findUnique({ where: { id : Number(id)}, include: { server_owner: flag } });
  return monitor;
};

const updateMonitorById = async (monitorId, updateBody) => {
  const monitor = await getMonitorById(monitorId,false);
  if (!monitor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sunucu bulunamadı');
  }
  const newBody = updateBody;
  const monitorData = Object.assign(monitor, newBody);
  const newMonitor = await Monitor.update({ where: { id: Number(monitorId) }, data: monitorData });
  return newMonitor;
};

const deleteMonitorById = async (deleteMonitorId) => {
  const monitor = await getMonitorById(deleteMonitorId);
  if (!monitor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Monitor not found');
  }
  await Monitor.delete({ where: { id: Number(deleteMonitorId) } });
  return monitor;
};

module.exports = {
  createMonitor,
  getMonitor,
  getMonitorById,
  updateMonitorById,
  deleteMonitorById,
  runJob,
};
