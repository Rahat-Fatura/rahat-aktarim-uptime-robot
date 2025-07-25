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
            `Monitor is UP. ${monitor.monitorType} on IP: ${pingMonitor.host}`,
            `Merhaba ${monitor.serverOwner.name},
            Rahat Up izleme sistemine eklediğiniz servisine erişim denemesi başarıyla sonuçlandı.
            📌 Servis Bilgileri:
                Servis Adı: ${monitor.name}
                Durum: ✅ Erişilebilir (UP)
                Kontrol Zamanı: ${new Date(monitor.controlTime)}
                Yanıt Süresi: ${result.responseTime}ms
                Servisiniz izleme kapsamına alınmıştır. Bundan sonraki erişim durumlarıyla ilgili gelişmelerde size bilgi vermeye devam edeceğiz.
                Yardım veya sorularınız için bize +90542 315 88 12 numara üzerinden ulaşabilirsiniz.
                Saygılarımızla,
                Rahat Up Ekibi`
          );
        } catch (error) {}
      }
      monitor.failCount = monitor.failCountRef;
      monitor.status = "up";
      monitor.isProcess = false;
      const now = new Date();
      monitor.controlTime = new Date(
        now.getTime() + cronExprension(monitor.interval, monitor.intervalUnit)
      );
      await monitorLogService.createLog(monitor, result);
      await monitorService.monitorUpdateAfterTask(monitor);
    } else {
      monitor.failCount--;
      if (monitor.failCount === 0) {
        try {
          await emailService.sendEmail(
            `<${monitor.serverOwner.email}>`,
            `Monitor is DOWN. ${monitor.monitorType} on IP: ${pingMonitor.host}`,
            `Merhaba ${monitor.serverOwner.name},
            Rahat Up izleme sistemimiz, aşağıdaki servisinize şu anda erişim sağlanamadığını tespit etti:
            📌 Servis Bilgileri:
                Servis Adı: ${monitor.name}
                Durum: ❌ Erişim Yok (DOWN)
                Kontrol Zamanı: ${new Date(monitor.controlTime)}
                Yanıt Süresi: ${result.responseTime}ms 
                Erişim problemi devam ettiği sürece izleme yapılmaya devam edilecektir.
                Servis yeniden erişilebilir olduğunda tarafınıza tekrar bilgilendirme yapılacaktır.
                Yardım veya sorularınız için bize +90542 315 88 12 numara üzerinden ulaşabilirsiniz.
                Saygılarımızla,
                Rahat Up Ekibi`
          );
          
        } catch (error) {}
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
  sendPing,
};
