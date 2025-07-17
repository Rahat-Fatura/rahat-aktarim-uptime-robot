const axios = require("axios");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { cronExprension } = require("../Jobs/utils/taskUtils");
const prisma = require("../utils/database");
const Monitor = require("../utils/database").monitor;

/**
 * Create a user
 * @param {Object} monitorBody
 * @returns {Promise<User>}
 */
const createMonitor = async (monitorBody, userId) => {
  const now = new Date();
  now.setMonth(now.getMonth() + 1);
  const controlTime = new Date(
    new Date().getTime() +
      cronExprension(monitorBody.interval, monitorBody.intervalUnit)
  );
  const monitorData = Object.assign(monitorBody, {
    serverOwner: { connect: { id: Number(userId) } },
    controlTime: controlTime,
    reportTime: now,
  });
  console.log("Create monitor:", monitorData);
  const monitor = await Monitor.create({ data: monitorData });
  console.log("Monitor created:", monitor);
  return monitor;
};

const getMonitor = async (userId) => {
  let monitor;
  try {
    monitor = await Monitor.findMany({
      where: {
        serverOwner: { id: Number(userId) },
      },
      select: {
        id: true,
        name: true,
        monitorType: true,
        status: true,
        isActiveByOwner: true,
        httpMonitor: {
          select: {
            host: true,
            method: true,
          },
        },
        pingMonitor: {
          select: {
            host: true,
          },
        },
        portMonitor: {
          select: {
            host: true,
            port: true,
          },
        },
        keyWordMonitor: {
          select: {
            host: true,
            method: true,
          },
        },
        cronJobMonitor: {
          select: {
            host: true,
          },
        },
        logs: true,
      },
    });
    monitor = monitor.map((obj) => {
      return Object.fromEntries(
        Object.entries(obj).filter(([key, value]) => value !== null)
      );
    });
  } catch (error) {
    console.log("Error fetching monitors:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error fetching monitors"
    );
  }

  return monitor;
};

const getInstantMonitors = async (user) => {
  let monitor;
  if (user.role == "admin") {
    monitor = await Monitor.findMany({ include: { logs: true } });
  } else {
    try {
      monitor = await Monitor.findMany({
        where: {
          serverOwner: { id: user.id },
        },
        select: {
          id: true,
          name: true,
          httpMonitor: {
            select: {
              host: true,
            },
          },
          pingMonitor: {
            select: {
              host: true,
            },
          },
          portMonitor: {
            select: {
              host: true,
            },
          },
          keyWordMonitor: {
            select: {
              host: true,
            },
          },
        },
      });

      monitor = monitor.map((obj) => {
        const subMonitor =
          obj.httpMonitor ||
          obj.pingMonitor ||
          obj.portMonitor ||
          obj.keyWordMonitor;
        const host = subMonitor?.host || null;

        const {
          httpMonitor,
          pingMonitor,
          portMonitor,
          keyWordMonitor,
          ...rest
        } = obj;

        return {
          ...rest,
          host,
        };
      });
      console.log("Filter Before", monitor);
      monitor = monitor.filter((obj) => obj.host !== null);
      console.log("Filter After", monitor);
    } catch (error) {
      console.log("Error fetching monitors:", error);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Error fetching monitors"
      );
    }
  }
  return monitor;
};

const getMonitorById = async (id, flag) => {
  const monitor = await Monitor.findUnique({
    where: { id: Number(id) },
    include: { serverOwner: flag, maintanance: flag },
  });
  return monitor;
};

const getMonitorByIdWithLogs = async (monitorId) => {
  const monitor = await Monitor.findUnique({
    where: { id: Number(monitorId) },
    include: {
      httpMonitor: true,
      pingMonitor: true,
      portMonitor: true,
      keyWordMonitor: true,
      cronJobMonitor: true,
      serverOwner: true,
      maintanance: true,
      logs: true,
    }
  });
  return monitor;
};

const updateMonitorById = async (monitorId, updateBody) => {
  const monitor = await getMonitorById(monitorId, false);
  if (!monitor) {
    throw new ApiError(httpStatus.NOT_FOUND, "Sunucu bulunamadı");
  }
  const newBody = updateBody;
  const monitorData = Object.assign(monitor, newBody);
  const newMonitor = await Monitor.update({
    where: { id: Number(monitorId) },
    data: updateBody,
  });
  return newMonitor;
};

const deleteMonitorById = async (deleteMonitorId) => {
  const monitor = await getMonitorById(deleteMonitorId, true);
  if (!monitor) {
    throw new ApiError(httpStatus.NOT_FOUND, "Monitor not found");
  }
  await Monitor.delete({ where: { id: Number(deleteMonitorId) } });
  return monitor;
};

const getInstantControlMonitorById = async (id) => {
  const monitor = await Monitor.findUnique({
    where: { id: Number(id) },
    include: {
      httpMonitor: true,
      pingMonitor: true,
      portMonitor: true,
      keyWordMonitor: true,
    },
  });
  return monitor;
};

const getMaintenance = async (userId) => {
  let monitor = await Monitor.findMany({
    where: { serverOwner: { id: Number(userId) } },
    select: {
      id: true,
      name: true,
      status: true,
      maintanance: {
        select: {
          startTime: true,
          endTime: true,
          status: true,
        },
      },
      httpMonitor: {
        select: {
          host: true,
        },
      },
      pingMonitor: {
        select: {
          host: true,
        },
      },
      portMonitor: {
        select: {
          host: true,
        },
      },
      keyWordMonitor: {
        select: {
          host: true,
        },
      },
      cronJobMonitor: {
        select: {
          host: true,
        },
      },
    },
  });
  monitor = monitor.map((obj) => {
    const subMonitor =
      obj.cronJobMonitor ||
      obj.httpMonitor ||
      obj.pingMonitor ||
      obj.portMonitor ||
      obj.keyWordMonitor;
    const host = subMonitor?.host || null;

    const {
      httpMonitor,
      pingMonitor,
      portMonitor,
      keyWordMonitor,
      cronJobMonitor,
      ...rest
    } = obj;

    return {
      ...rest,
      host,
    };
  });
  return monitor;
};

const getCronJobMonitorWithBody = async (id) => {
  let cronJobMonitor;
  try {
    cronJobMonitor = await Monitor.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        name: true,
        monitorType: true,
        cronJobMonitor: true,
        serverOwner: {
          select: {
            name: true,
            email: true,
          },
        },
        controlTime: true,
        status: true,
        isProcess: true,
        interval: true,
        intervalUnit: true,
      },
    });
  } catch (error) {
    console.log(error);
  }
  return cronJobMonitor;
};

const getHttpMonitorWithBody = async (id) => {
  let httpMonitor;
  try {
    httpMonitor = await Monitor.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        name: true,
        monitorType: true,
        httpMonitor: true,
        serverOwner: {
          select: {
            name: true,
            email: true,
          },
        },
        controlTime: true,
        status: true,
        isProcess: true,
        interval: true,
        intervalUnit: true,
      },
    });
  } catch (error) {
    console.log(error);
  }
  return httpMonitor;
};

const getPingMonitorWithBody = async (id) => {
  let pingMonitor;
  try {
    pingMonitor = await Monitor.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        name: true,
        monitorType: true,
        pingMonitor: true,
        serverOwner: {
          select: {
            name: true,
            email: true,
          },
        },
        controlTime: true,
        status: true,
        isProcess: true,
        interval: true,
        intervalUnit: true,
      },
    });
  } catch (error) {
    console.log(error);
  }
  return pingMonitor;
};

const getPortMonitorWithBody = async (id) => {
  let portMonitor;
  try {
    portMonitor = await Monitor.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        name: true,
        monitorType: true,
        portMonitor: true,
        serverOwner: {
          select: {
            name: true,
            email: true,
          },
        },
        controlTime: true,
        status: true,
        isProcess: true,
        interval: true,
        intervalUnit: true,
      },
    });
  } catch (error) {
    console.log(error);
  }
  return portMonitor;
};

const getKeyWordMonitorWithBody = async (id) => {
  let keyWordMonitor;
  try {
    keyWordMonitor = await Monitor.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        name: true,
        monitorType: true,
        keyWordMonitor: true,
        serverOwner: {
          select: {
            name: true,
            email: true,
          },
        },
        controlTime: true,
        status: true,
        isProcess: true,
        interval: true,
        intervalUnit: true,
      },
    });
  } catch (error) {
    console.log(error);
  }
  return keyWordMonitor;
};

const reportRender = async () => {
 
    const monitors = await Monitor.findMany({
      where: {
        reportTime: {
          lte: new Date(),
        }
      },
    });


  return monitors;
};

const runJob = async () => {
  const monitors = await prisma.$transaction(async (tx) => {
    const toProcesses = await Monitor.findMany({
      where: {
        controlTime: {
          lte: new Date(),
        },
        isProcess: false,
        isActiveByOwner: true,
      },
      select: {
        id: true,
        monitorType: true,
      },
    });
    const ids = toProcesses.map((m) => m.id);

    const monitors = await tx.monitor.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        isProcess: true,
      },
    });
    
    return toProcesses;
  });

  return monitors;
};

const staytedsInQueue = async () => {
  await Monitor.updateMany({
    data: {
      isProcess: false,
    },
  });
};

const getMonitorsOnlyId = async(userId) => {
 let monitors;
 try{
    monitors = await Monitor.findMany({
      where:{
        serverOwner: {id: userId} 
      },
      select:{
        id: true
      }
    })
 }
 catch(error){
  console.log("Error fetching  Id:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error fetching monitors Id"
    );
 }
 return monitors.map(obj => obj.id);
}

const updateMonitorsByIds = async(ids, updateBody) =>{
  try{
    const monitors = await Monitor.updateMany({
    where:{
      id:{
        in:ids
      }
    },
    data: updateBody
  })
  return monitors
  }
  catch(error){
     console.log(error)
     return new ApiError(httpStatus[500], 'Güncelleme yapılırken hata oluştu !')
  }
  
}

const deleteMonitorsByIds = async(ids) =>{
  try{
    const monitors = await Monitor.deleteMany({
    where:{
      id:{
        in: ids
      }
    }
  })
  return monitors
  }
  catch(error){
     console.log(error)
     return new ApiError(httpStatus[500], 'Silme işlemler yapılırken hata oluştu !')
  }
  
}

module.exports = {
  createMonitor,
  getMonitor,
  getInstantMonitors,
  getInstantControlMonitorById,
  getMonitorById,
  getMonitorByIdWithLogs,
  updateMonitorById,
  deleteMonitorById,
  reportRender,
  runJob,
  getMaintenance,
  getCronJobMonitorWithBody,
  getHttpMonitorWithBody,
  getPingMonitorWithBody,
  getPortMonitorWithBody,
  getKeyWordMonitorWithBody,
  staytedsInQueue,
  getMonitorsOnlyId,
  updateMonitorsByIds,
  deleteMonitorsByIds
};
