const {
  monitorService,
  monitorLogService,
  emailService,
  httpMonitorService,
} = require("../../services");
const axios = require("axios");
const { cronExprension } = require("../utils/taskUtils");

async function monitorTask(monitor) {
  try {
    // console.log("Http Monitor Task Çalışıyor !", monitor);
    monitor = await monitorService.getHttpMonitorWithBody(monitor.id);
    const httpMonitor = monitor.httpMonitor;
    const result = await sendRequest(httpMonitor);
    if (!result.isError) {
      if (monitor.status === "down" || monitor.status === "uncertain") {
        try {
          await emailService.sendEmail(
            `<${monitor.serverOwner.email}>`,
            `Monitor is UP. ${monitor.monitorType} on ${httpMonitor.host} ${httpMonitor.method}`,
            `Merhaba ${monitor.serverOwner.name},
            Rahat Up izleme sistemine eklediğiniz servisine erişim denemesi başarıyla sonuçlandı.
            📌 Servis Bilgileri:
                Servis Adı: ${monitor.name}
                Durum: ✅ Erişilebilir (UP)
                Kontrol Zamanı: ${new Date(monitor.controlTime)}
                Yanıt Kodu: ${result.status}
                Yanıt Süresi: ${result.responseTime}ms
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
            `Monitor is DOWN. ${monitor.monitorType} on ${httpMonitor.host} ${httpMonitor.method}`,
            `Merhaba ${monitor.serverOwner.name},
            Rahat Up izleme sistemimiz, aşağıdaki servisinize şu anda erişim sağlanamadığını tespit etti:
            📌 Servis Bilgileri:
                Servis Adı: ${monitor.name}
                Durum: ❌ Erişim Yok (DOWN)
                Kontrol Zamanı: ${new Date(monitor.controlTime)}
                Yanıt Kodu: ${result.status}
                Yanıt Süresi: ${result.responseTime}ms 
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

async function sendRequest(monitor) {
  const startTime = Date.now();
  let responseTime = 0;
  let isError = false;
  let status;
  try {
    const config = {
      method: monitor.method,
      url: monitor.host,
      headers: monitor.headers || {},
      timeout: monitor.timeout || 20000,
    };
    if (["POST", "PUT", "PATCH"].includes(monitor.method)) {
      config.data = monitor.body || {};
    }
    const response = await axios(config);
    console.log(response.status);
    responseTime = Date.now() - startTime;
    if (monitor.allowedStatusCodes.length > 0) {
      isError = !monitor.allowedStatusCodes.includes(
        response.status.toString()
      );
      status = response.status;
      return {
        status: status,
        responseTime,
        isError,
        message: isError ? "unsuccess" : "success",
      };
    } else {
      status = response.status;
      return {
        status: status,
        responseTime,
        isError,
        message: isError ? "unsuccess" : "success",
      };
    }
  } catch (error) {
    responseTime = Date.now() - startTime;
    if (error.status) {
      if (monitor.allowedStatusCodes.length > 0) {
        isError = !monitor.allowedStatusCodes.includes(
          response.status.toString()
        );
        status = error.status;
      } else {
        status = error.status;
        isError = true;
      }
    } else {
      console.log("error", error.status);
      isError = true;
    }
    //console.log('error', error);
  } finally {
    return {
      status: status || 0,
      responseTime,
      isError,
      message: isError ? "unsuccess" : "success",
    };
  }
}

module.exports = {
  monitorTask,
  sendRequest,
};
