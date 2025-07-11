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
    let portMonitor = monitor.portMonitor;
    const result = await controlPort(portMonitor);
    if (!result.isError) {
      if (monitor.status === "down" || monitor.status === "uncertain") {
        try {
          await emailService.sendEmail(
            `<${monitor.serverOwner.email}>`,
            `Monitor is UP. ${monitor.monitorType} on IP:${portMonitor.host} Port:${portMonitor.port}`,
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
      if (monitor.status === "up" || monitor.status === "uncertain") {
        try {
          await emailService.sendEmail(
            `<${monitor.serverOwner.email}>`,
            `Monitor is DOWN. ${monitor.monitorType} on IP:${portMonitor.host} PORT:${portMonitor.port}`,
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
      console.log("connect Çalıltı")
      isOpen = true;
      socket.destroy();
    });

    socket.on("timeout", () => {
      console.log("timeOut Çalıltı")
      isOpen = false;
      socket.destroy();
    });

    socket.on("error", (error) => {
      console.log("onError Çalıltı: ", error)
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
