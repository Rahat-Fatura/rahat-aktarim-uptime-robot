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
      monitor.status = "up";
      monitor.isProcess = false;
      const now = new Date();
      monitor.controlTime = new Date(
        now.getTime() + cronExprension(monitor.interval, monitor.intervalUnit)
      );
      await monitorLogService.createLog(monitor, result);
      await monitorService.monitorUpdateAfterTask(monitor);
    } else {
      if (monitor.status === "up" || monitor.status === "uncertain") {
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
      const now = new Date();
      monitor.controlTime = new Date(
        now.getTime() + cronExprension(monitor.interval, monitor.intervalUnit)
      );
      await monitorLogService.createLog(monitor, result);
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
