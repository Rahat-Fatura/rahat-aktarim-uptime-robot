/* eslint-disable prettier/prettier */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
/* eslint-disable no-console */
const axios = require('axios');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { cronExprension } = require('../Jobs/utils/taskUtils');
const prisma = require('../utils/database');
const Monitor = require('../utils/database').monitor;

/**
 * Create a user
 * @param {Object} monitorBody
 * @returns {Promise<User>}
 */
const createMonitor = async (monitorBody, user) => { 
  if (await Monitor.findFirst({ where: { userId: user.id, host: monitorBody.host } })) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'host adres daha önce alınmış');
  }
  const now = new Date();
  const controlTime =  new Date(now.getTime() + cronExprension(monitorBody.interval, monitorBody.intervalUnit));
  const monitorData = Object.assign(monitorBody, { serverOwner: { connect: { id: user.id } }, controlTime: controlTime });
  console.log("Create monitor:",monitorData);
  const monitor = await Monitor.create({ data: monitorData }); 
  console.log("Monitor created:",monitor);
  return monitor;
};

const getMonitor = async (user) => {
  let monitor;
  if (user.role == 'admin') {
    monitor = await Monitor.findMany({ include: { logs: true } });
  } else {
    try {
      monitor = await Monitor.findMany({ where: { serverOwner: { id: user.id } },
         include: { logs: true },
      });
    }
    catch (error) {
      console.log("Error fetching monitors:", error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error fetching monitors');
    }
  }
  return monitor;
};

const getMonitorById = async (monitorId, flag) => {
  const monitor = await Monitor.findUnique({ where: { id : Number(monitorId)}, include: { serverOwner: flag, maintanance: flag } });
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
  const monitor = await getMonitorById(deleteMonitorId,true);
  if (!monitor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Monitor not found');
  }
  await Monitor.delete({ where: { id: Number(deleteMonitorId) } });
  return monitor;
};

const getMaintenance = async (user) => {
  const monitor = await Monitor.findMany({ where: { serverOwner: { id: user.id }},
     select: { id: true,
               host: true,
               name: true,
               status: true,
               maintanance:{
                select: {
                  startTime: true,
                  endTime: true,
                  status: true,
                }
                } 
              } });
  return monitor;
}

const runJob = async () => {
  const monitors = await prisma.$transaction(async(tx)=>{
    const toProcesses= await Monitor.findMany({
      where:{
        controlTime:{
          lte: new Date()
        },
        isProcess: false,
        isActiveByOwner: true
      },
      include:{
        serverOwner:true,
        maintanance: true
      }
    })

    const ids = toProcesses.map(m=>m.id);

    await tx.monitor.updateMany({
      where:{
        id: {in: ids}
      },
      data:{
        isProcess: true
      },
    })

    return toProcesses;
  })

  return monitors;
};

module.exports = {
  createMonitor,
  getMonitor,
  getMonitorById,
  updateMonitorById,
  deleteMonitorById,
  runJob,
  getMaintenance
};
