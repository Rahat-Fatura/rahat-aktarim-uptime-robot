const net = require("net");
const {
  monitorService,
  monitorLogService,
  emailService,
  portMonitorService,
} = require("../../services");
const { cronExprension } = require("../utils/taskUtils");

const portTask = async (monitor) => {
  try {
    monitor = await monitorService.getPortMonitorWithBody(monitor.id);
    let port = monitor.portMonitor;
    const result = await controlPort(port);
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

function port(host, port) {
  return new Promise((resolve, reject) => {
    tcpp.probe(host, port, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

function checkTcpPort(host, port, timeout) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isOpen = false;

    socket.setTimeout(timeout);

    socket.on("connect", () => {
      isOpen = true;
      socket.destroy();
    });

    socket.on("timeout", () => {
      isOpen = false;
      socket.destroy();
    });

    socket.on("error", () => {
      isOpen = false;
    });

    socket.on("close", () => {
      resolve(isOpen);
    });

    socket.connect(port, host);
  });
}

async function controlPort(monitor) {
  let isError = false;
  let status;
  try {
    const startTime = Date.now();
    const response = await checkTcpPort(
      monitor.host,
      monitor.port,
      monitor.timeOut * 1000
    );
    const responseTime = Date.now() - startTime;
    status = response.status;
    if (response === false) {
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
  portTask,
  controlPort,
};
