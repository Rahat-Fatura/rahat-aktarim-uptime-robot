const { isError } = require("joi");
const {
  monitorService,
  monitorLogService,
  emailService,
  cronJobMonitorService,
} = require("../../services");
const { cronExprension } = require("../utils/taskUtils");

async function cronJobTask(monitor) {
  try {
    monitor = await monitorService.getCronJobMonitorWithBody(monitor.id);
    let cronJobMonitor = monitor.cronJobMonitor;
    const result = controlRequestTime(cronJobMonitor, monitor.controlTime);
    if (!result.isError) {
      if (monitor.status === "down" || monitor.status === "uncertain") {
        try {
          await emailService.sendEmail(
            `<${monitor.serverOwner.email}>`,
            `Rahat Sistem Sunucu kontrollörü  ${result.controlTime}`,
            `Sunucunuz çalışıyor ...
             HOST ADI: ${cronJobMonitor.host}
             STATUS CODE: ${result.status}
             Message: ${result.message}`
          );
        } catch (error) {console.log(error);}
      }
      monitor.status = "up";
      monitor.isProcess = false;
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
    } else {
      try {
        await emailService.sendEmail(
          `<${monitor.serverOwner.email}>`,
          `Rahat Sistem Sunucu kontrollörü  ${result.controlTime}`,
          `Sunucunuz çalışıyor ...
             HOST ADI: ${cronJobMonitor.host}
             STATUS CODE: ${result.status}
             Message: ${result.message}`
        );
      } catch (error) {console.log(error);}
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
}

const controlRequestTime = (cronJobMonitor, controlTime) => {
  const beforeDate = new Date(
    controlTime - cronExprension(cronJobMonitor.devitionTime * 2, "minutes")
  );
  if (cronJobMonitor.lastRequestTime === null) {
    return {
      isError: true,
      message: "Your CronJob Monitor is not active",
      status: "inactive time",
      isActiveByOwner: false,
      controlTime: controlTime,
    };
  }
  if (
    beforeDate.getTime() <= cronJobMonitor.lastRequestTime.getTime() &&
    cronJobMonitor.lastRequestTime.getTime() <= controlTime.getTime()
  ) {
    return {
      isError: false,
      message: "Your CronJob Monitor is active",
      status: "active time",
      isActiveByOwner: true,
      controlTime: controlTime,
    };
  } else {
    return {
      isError: true,
      message: "Your CronJob Monitor is not active",
      status: "inactive time",
      isActiveByOwner: true,
      controlTime: cronJobMonitor.controlTime,
    };
  }
};

module.exports = {
  cronJobTask,
  controlRequestTime,
};
