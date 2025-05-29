const ping = require("ping");
const {
  monitorService,
  monitorLogService,
  emailService,
  pingMonitorService,
} = require("../../services");
const { cronExprension } = require("../utils/taskUtils");

const pingTask = async (monitor) => {
  try {
    monitor = await monitorService.getPingMonitorWithBody(monitor.id);
    const pingMonitor = monitor.pingMonitor;
    const result = await sendPing(pingMonitor);
    if (!result.isError) {
      if (monitor.status === "down" || monitor.status === "uncertain") {
        try {
          await emailService.sendEmail(
            `<${monitor.serverOwner.email}>`,
            `Rahat Sistem Sunucu kontrollörü  ${keyWordMonitor.method}`,
            `Sunucunuz çalışıyor ...
             HOST ADI: ${monitor.host}
             STATUS CODE: ${result.status}
             Message: ${result.message}`
          );
        } catch (error) {}
      }
      monitor.status = "up";
      monitor.isProcess = false;
      const now = new Date();
      monitor.controlTime = new Date(
        now.getTime() + cronExprension(monitor.interval, monitor.intervalUnit)
      );
      //console.log(monitor)
      await monitorLogService.createLog(monitor, result);
      await monitorService.updateMonitorById(monitor.id, {
        status: monitor.status,
        isProcess: monitor.isProcess,
        controlTime: monitor.controlTime,
      });
    } else {
      try {
        await emailService.sendEmail(
          `<${monitor.serverOwner.email}>`,
          `Rahat Sistem Sunucu kontrollörü  ${keyWordMonitor.method}`,
          `Sunucunuz çalışıyor ...
             HOST ADI: ${monitor.host}
             STATUS CODE: ${result.status}
             Message: ${result.message}`
        );
      } catch (error) {}
      monitor.isProcess = false;
      monitor.status = "down";
      const now = new Date();
      monitor.controlTime = new Date(
        now.getTime() + cronExprension(monitor.interval, monitor.intervalUnit)
      );
      await monitorLogService.createLog(monitor, result);
      await monitorService.updateMonitorById(monitor.id, {
        status: monitor.status,
        isProcess: monitor.isProcess,
        controlTime: monitor.controlTime,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

function runPing(host) {
  return new Promise((resolve, reject) => {
    ping.sys.probe(host, function (isAlive) {
      if (isAlive) {
        resolve(isAlive);
      } else {
        resolve(isAlive);
      }
    });
  });
}

async function sendPing(monitor) {
  const startTime = Date.now();
  let isError = false;
  let status;
  try {
    const response = await runPing(monitor.host);
    const responseTime = Date.now() - startTime;
    status = response.status;
    if (!response) {
      return {
        status: -1,
        responseTime: responseTime,
        isError: true,
        message: "unsuccess",
      };
    } else {
      return {
        status: 0,
        responseTime: responseTime,
        isError: false,
        message: "success",
      };
    }
  } catch (error) {
    console.log("error", error);
  } finally {
  }
}

module.exports = {
  pingTask,
  sendPing
};
