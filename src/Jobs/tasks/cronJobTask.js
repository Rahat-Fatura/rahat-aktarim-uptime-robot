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
    monitor = await monitorService.getMonitorWithBodyForTask(monitor.id);
    let now = new Date();
    now.setMilliseconds(0);
    monitor.controlTime = new Date(
      now.getTime() + cronExprension(monitor.interval, monitor.intervalUnit)
    );
    if (monitor.cronJobMonitor.lastRequestTime != null) {
      let cronJobMonitor = monitor.cronJobMonitor;
      const result = controlRequestTime(cronJobMonitor, monitor.controlTime);
      if (!result.isError) {
        if (monitor.status === "down" || monitor.status === "uncertain") {
          try {
            await emailService.sendEmail(
              `<${monitor.serverOwner.email}>`,
              `Monitor is UP. ${monitor.monitorType} on ${cronJobMonitor.host}`,
              `Merhaba ${monitor.serverOwner.name},
            Rahat Up izleme sistemine eklediğiniz servisine erişim denemesi başarıyla sonuçlandı.
            📌 Servis Bilgileri:
                Servis Adı: ${monitor.name}
                Durum: ✅ Erişilebilir (UP)
                Kontrol Zamanı: ${new Date(monitor.controlTime)}
                Yanıt Kodu: ${result.status}
                Servisiniz izleme kapsamına alınmıştır. Bundan sonraki erişim durumlarıyla ilgili gelişmelerde size bilgi vermeye devam edeceğiz.
                Yardım veya sorularınız için bize +90542 315 88 12 numara üzerinden ulaşabilirsiniz.
                Saygılarımızla,
                Rahat Up Ekibi`
            );
          } catch (error) {
            console.log(error);
          }
        }
        monitor.failCount = monitor.failCountRef;
        monitor.status = "up";
        monitor.isProcess = false;
        await monitorLogService.createLog(monitor, result);
        await monitorService.monitorUpdateAfterTask(monitor);
      } else {
        monitor.failCount--;
        if (monitor.failCount === 0) {
          try {
            await emailService.sendEmail(
              `<${monitor.serverOwner.email}>`,
              `Monitor is DOWN. ${monitor.monitorType} on ${cronJobMonitor.host}`,
              `Merhaba ${monitor.serverOwner.name},
            Rahat Up izleme sistemimiz, aşağıdaki servisinize şu anda erişim sağlanamadığını tespit etti:
            📌 Servis Bilgileri:
                Servis Adı: ${monitor.name}
                Durum: ❌ Erişim Yok (DOWN)
                Kontrol Zamanı: ${new Date(monitor.controlTime)}
                Yanıt Kodu: ${result.status}
                Erişim problemi devam ettiği sürece izleme yapılmaya devam edilecektir.
                Servis yeniden erişilebilir olduğunda tarafınıza tekrar bilgilendirme yapılacaktır.
                Yardım veya sorularınız için bize +90542 315 88 12 numara üzerinden ulaşabilirsiniz.
                Saygılarımızla,
                Rahat Up Ekibi`
            );
          } catch (error) {
            console.log(error);
          }
        }
        monitor.isProcess = false;
        monitor.status = "down";
        await monitorLogService.createLog(monitor, result);
        await monitorService.monitorUpdateAfterTask(monitor);
      }
    } else {
      monitor.isProcess = false;
      await monitorService.monitorUpdateAfterTask(monitor);
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
      isError: false,
      message:
        "Your CronJob Monitor is now started. Please insert the generated URL into the cronjob!",
      status: "started time",
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
