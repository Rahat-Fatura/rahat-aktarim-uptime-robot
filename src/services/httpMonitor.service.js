const monitorService = require("./").monitorService;
const HttpMonitor = require("../utils/database").httpMonitor;
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

const createHttpMonitor = async (monitorBody, userId) => {
  let httpMonitor;
  let monitor;
  const body = {
    name: monitorBody.name,
    monitorType: "HttpMonitor",
    interval: monitorBody.interval,
    intervalUnit: monitorBody.intervalUnit,
    failCount: monitorBody.failCountRef,
    failCountRef: monitorBody.failCountRef,
  };
  httpMonitor = await HttpMonitor.findFirst({
    where: {
      AND: [
        {
          host: monitorBody.httpMonitor.host,
        },
        {
          userId: Number(userId),
        },
        {
          method: monitorBody.httpMonitor.method,
        },
      ],
    },
  });
  if (httpMonitor) {
    throw new ApiError(httpStatus.BAD_REQUEST, "host adresi daha önce alınmış");
  }
  try {
    monitor = await monitorService.createMonitor(body, userId);
    httpMonitor = await HttpMonitor.create({
      data: {
        id: monitor.id,
        host: monitorBody.httpMonitor.host,
        method: monitorBody.httpMonitor.method,
        body: monitorBody.httpMonitor.body,
        headers: monitorBody.httpMonitor.headers,
        allowedStatusCodes: monitorBody.httpMonitor.allowedStatusCodes,
        timeOut: monitorBody.httpMonitor.timeOut || 30,
        userId: Number(userId),
      },
    });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "host adres daha önce alınmış");
    console.log(error);
  }

  return monitor;
};

const getHttpMonitorById = async (id) => {
  let monitor;
  try {
    monitor = await HttpMonitor.findUnique({
      where: {
        id: Number(id),
      },
    });
  } catch (error) {
    console.log(error);
  }
  return monitor;
};

const getHttpMonitorFullDataById = async (id) => {
  let monitor;
  try {
    monitor = await HttpMonitor.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        host: true,
        method: true,
        body: true,
        headers: true,
        timeOut: true,
        allowedStatusCodes: true,
        monitor: {
          select: {
            name: true,
            interval: true,
            intervalUnit: true,
            failCountRef: true,
            notifications: {
              select: {
                emails: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.log(error);
  }
  console.log(monitor);
  return monitor;
};

const updateHttpMonitorById = async (id, updateData) => {
  const httpBody = updateData.httpMonitor;
  delete updateData.httpMonitor;
  updateData.failCount = updateData.failCountRef;
  const monitorBody = updateData;
  let httpMonitor = await getHttpMonitorById(id);
  if (!httpMonitor) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Http Monitor can not find !");
  }
  try {
    await monitorService.updateMonitorById(id, monitorBody);
    httpMonitor = await HttpMonitor.update({
      where: { id: Number(id) },
      data: httpBody,
    });
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, "Unsuccess update Monitor !");
  }
  return httpMonitor;
};

module.exports = {
  createHttpMonitor,
  updateHttpMonitorById,
  getHttpMonitorById,
  getHttpMonitorFullDataById,
};
