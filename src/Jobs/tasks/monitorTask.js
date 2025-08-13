const {
  monitorService,
  monitorLogService,
  emailService,
} = require("../../services");
const config = require("../../config/config");
const axios = require("axios");
const { cronExprension } = require("../utils/taskUtils");
const moment = require("moment");
async function monitorTask(monitor) {
  try {
    monitor = await monitorService.getMonitorWithBodyForTask(monitor.id);
    let now = new Date();
    now.setMilliseconds(0);
    monitor.controlTime = new Date(
      now.getTime() + cronExprension(monitor.interval, monitor.intervalUnit)
    );
    let flag = monitor.maintanance != null ? monitor.maintanance.status : false;
    if (monitor.isActiveByOwner && !flag) {
      const httpMonitor = monitor.httpMonitor;
      const result = await sendRequest(httpMonitor);
      if (!result.isError) {
        if (
          monitor.status === "down" ||
          monitor.status === "uncertain" ||
          (result.slowResponse.isError && httpMonitor.slowResponseAlertStatus)
        ) {
          try {
            await emailService.sendEmailHtml(
              `<${monitor.serverOwner.email}>`,
              `Monitor is UP ${monitor.monitorType} on ${httpMonitor.host} ${httpMonitor.method}`,
              `
<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rahat Up - Servis Durumu</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="padding:24px 28px;background: linear-gradient(90deg,#0ea5a1,#06b6d4); color:white;">
              <table width="100%" role="presentation">
                <tr>
                  <td style="vertical-align:middle;">
                    <h1 style="margin:0;font-size:20px;line-height:1;font-weight:700;">Rahat Up</h1>
                    <div style="opacity:0.95;font-size:13px;margin-top:6px;">Servis İzleme Bildirimi</div>
                  </td>
                  <td style="text-align:right;vertical-align:middle;">
                    <!-- opsiyonel logo alanı -->
                    <div style="width:48px;height:48px;border-radius:8px;background:rgba(255,255,255,0.12);display:inline-flex;align-items:center;justify-content:center;font-weight:700;">
                      TR
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:22px 28px 8px 28px;color:#0f172a;">
              <p style="margin:0 0 14px 0;font-size:15px;">
                Merhaba <strong>${monitor.serverOwner.name}</strong>,
              </p>

              <p style="margin:0 0 18px 0;color:#334155;font-size:14px;line-height:1.5;">
                Rahat Up izleme sistemine eklediğiniz servise erişim denemesi <strong style="color:#059669">başarıyla</strong> sonuçlandı.
              </p>

              <!-- Kart: servis bilgileri -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e6eef6;border-radius:8px;padding:12px;background:#fbfdff;">
                <tr>
                  <td style="padding:8px 12px;font-size:13px;color:#0f172a;">
                    <div style="display:flex;flex-wrap:wrap;gap:8px;">
                      <div style="flex:1;min-width:160px;">
                        <div style="font-size:12px;color:#64748b;">Servis Adı</div>
                        <div style="font-weight:700;margin-top:4px;">${
                          monitor.name
                        }</div>
                      </div>

                      <div style="flex:1;min-width:140px;">
                        <div style="font-size:12px;color:#64748b;">Durum</div>
                        <div style="font-weight:700;margin-top:4px;color:#059669;">🟢 Başarılı (UP)</div>
                      </div>

                      <div style="flex:1;min-width:180px;">
                        <div style="font-size:12px;color:#64748b;">Kontrol Zamanı</div>
                        <div style="font-weight:700;margin-top:4px;">${moment(
                          monitor.controlTime
                        ).format("DD.MM.YYYY HH:mm:ss")}</div>
                      </div>

                      <div style="flex:1;min-width:120px;">
                        <div style="font-size:12px;color:#64748b;">Yanıt Kodu</div>
                        <div style="font-weight:700;margin-top:4px;">${
                          result.status
                        }</div>
                      </div>

                      <div style="flex:1;min-width:140px;">
                        <div style="font-size:12px;color:#64748b;">Yanıt Süresi</div>
                        <div style="font-weight:700;margin-top:4px;">${
                          result.responseTime
                        } ms</div>
                      </div>

                      <div style="flex:1;min-width:160px;">
                        <div style="font-size:12px;color:#64748b;">Yanıt Geciklemesi</div>
                        <div style="font-weight:700;margin-top:4px;color:#f59e0b;">${
                          result.slowResponse.message
                        }</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Host / Method -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr>
                  <td style="padding:8px 0;">
                    <div style="font-size:13px;color:#64748b;">Monitör Tipi</div>
                    <div style="font-weight:700;margin-top:6px;">${
                      monitor.monitorType
                    } — ${httpMonitor.host} (${httpMonitor.method})</div>
                  </td>
                </tr>
              </table>

              <!-- CTA veya bilgilendirme -->
              <div style="margin-top:18px;">
                <a href=${
                  config.app.url
                } style="display:inline-block;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600;background:linear-gradient(90deg,#06b6d4,#0ea5a1);color:white;">
                  Kontrol Paneline Git
                </a>
              </div>

              <p style="margin:18px 0 0 0;font-size:13px;color:#475569;line-height:1.5;">
                Servisiniz izleme kapsamına alınmıştır. Bundan sonraki erişim durumlarıyla ilgili gelişmelerde size bilgi vermeye devam edeceğiz.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 28px 26px 28px;background:#f8fafc;color:#64748b;font-size:13px;">
              <div style="margin-bottom:10px;">
                Yardım veya sorularınız için bize <strong>+90 542 315 88 12</strong> numarası üzerinden ulaşabilirsiniz.
              </div>
              <div style="font-size:12px;">
                Saygılarımızla,<br>
                <strong>Rahat Up Ekibi</strong>
              </div>

              <hr style="border:none;border-top:1px solid #e6eef6;margin:16px 0;">

              <div style="font-size:11px;color:#94a3b8;">
                Bu e-posta, Rahat Up izleme sistemi bildirimidir. Abonelik veya hesap ile ilgili sorularınız için destek ile iletişime geçin.
              </div>
            </td>
          </tr>

        </table>

        <!-- small spacer -->
        <div style="height:14px;"></div>

        <!-- Legal / small text -->
        <div style="font-size:12px;color:#94a3b8;max-width:600px;text-align:center;">
          &copy; ${new Date().getFullYear()} Rahat Up. Tüm hakları saklıdır.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`
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
        if (
          monitor.failCount === 0 ||
          (result.slowResponse.isError &&
            monitor.httpMonitor.slowResponseAlertStatus)
        ) {
          try {
            await emailService.sendEmailHtml(
              `<${monitor.serverOwner.email}>`,
              `Monitor is DOWN. ${monitor.monitorType} on ${httpMonitor.host} ${httpMonitor.method}`,
              `
<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rahat Up - Servis Durumu</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="padding:24px 28px;background: linear-gradient(90deg,#0ea5a1,#06b6d4); color:white;">
              <table width="100%" role="presentation">
                <tr>
                  <td style="vertical-align:middle;">
                    <h1 style="margin:0;font-size:20px;line-height:1;font-weight:700;">Rahat Up</h1>
                    <div style="opacity:0.95;font-size:13px;margin-top:6px;">Servis İzleme Bildirimi</div>
                  </td>
                  <td style="text-align:right;vertical-align:middle;">
                    <!-- opsiyonel logo alanı -->
                    <div style="width:48px;height:48px;border-radius:8px;background:rgba(255,255,255,0.12);display:inline-flex;align-items:center;justify-content:center;font-weight:700;">
                      TR
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:22px 28px 8px 28px;color:#0f172a;">
              <p style="margin:0 0 14px 0;font-size:15px;">
                Merhaba <strong>${monitor.serverOwner.name}</strong>,
              </p>

              <p style="margin:0 0 18px 0;color:#334155;font-size:14px;line-height:1.5;">
                Rahat Up izleme sistemine eklediğiniz servise erişim denemesi <strong style="color:#059669">başarısız</strong> sonuçlandı.
              </p>

              <!-- Kart: servis bilgileri -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e6eef6;border-radius:8px;padding:12px;background:#fbfdff;">
                <tr>
                  <td style="padding:8px 12px;font-size:13px;color:#0f172a;">
                    <div style="display:flex;flex-wrap:wrap;gap:8px;">
                      <div style="flex:1;min-width:160px;">
                        <div style="font-size:12px;color:#64748b;">Servis Adı</div>
                        <div style="font-weight:700;margin-top:4px;">${
                          monitor.name
                        }</div>
                      </div>

                      <div style="flex:1;min-width:140px;">
                        <div style="font-size:12px;color:#64748b;">Durum</div>
                        <div style="font-weight:700;margin-top:4px;color:#059669;">🔴 Başarısız (Down)</div>
                      </div>

                      <div style="flex:1;min-width:180px;">
                        <div style="font-size:12px;color:#64748b;">Kontrol Zamanı</div>
                        <div style="font-weight:700;margin-top:4px;">${moment(
                          monitor.controlTime
                        ).format("DD.MM.YYYY HH:mm:ss")}</div>
                      </div>

                      <div style="flex:1;min-width:120px;">
                        <div style="font-size:12px;color:#64748b;">Yanıt Kodu</div>
                        <div style="font-weight:700;margin-top:4px;">${
                          result.status
                        }</div>
                      </div>

                      <div style="flex:1;min-width:140px;">
                        <div style="font-size:12px;color:#64748b;">Yanıt Süresi</div>
                        <div style="font-weight:700;margin-top:4px;">${
                          result.responseTime
                        } ms</div>
                      </div>

                      <div style="flex:1;min-width:160px;">
                        <div style="font-size:12px;color:#64748b;">Yanıt Geciklemesi</div>
                        <div style="font-weight:700;margin-top:4px;color:#f59e0b;">${
                          result.slowResponse.message
                        }</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Host / Method -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr>
                  <td style="padding:8px 0;">
                    <div style="font-size:13px;color:#64748b;">Monitör Tipi</div>
                    <div style="font-weight:700;margin-top:6px;">${
                      monitor.monitorType
                    } — ${httpMonitor.host} (${httpMonitor.method})</div>
                  </td>
                </tr>
              </table>

              <!-- CTA veya bilgilendirme -->
              <div style="margin-top:18px;">
                <a href=${
                  config.app.url
                } style="display:inline-block;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600;background:linear-gradient(90deg,#06b6d4,#0ea5a1);color:white;">
                  Kontrol Paneline Git
                </a>
              </div>

              <p style="margin:18px 0 0 0;font-size:13px;color:#475569;line-height:1.5;">
                Servisiniz izleme kapsamına alınmıştır. Bundan sonraki erişim durumlarıyla ilgili gelişmelerde size bilgi vermeye devam edeceğiz.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 28px 26px 28px;background:#f8fafc;color:#64748b;font-size:13px;">
              <div style="margin-bottom:10px;">
                Yardım veya sorularınız için bize <strong>+90 542 315 88 12</strong> numarası üzerinden ulaşabilirsiniz.
              </div>
              <div style="font-size:12px;">
                Saygılarımızla,<br>
                <strong>Rahat Up Ekibi</strong>
              </div>

              <hr style="border:none;border-top:1px solid #e6eef6;margin:16px 0;">

              <div style="font-size:11px;color:#94a3b8;">
                Bu e-posta, Rahat Up izleme sistemi bildirimidir. Abonelik veya hesap ile ilgili sorularınız için destek ile iletişime geçin.
              </div>
            </td>
          </tr>

        </table>

        <!-- small spacer -->
        <div style="height:14px;"></div>

        <!-- Legal / small text -->
        <div style="font-size:12px;color:#94a3b8;max-width:600px;text-align:center;">
          &copy; ${new Date().getFullYear()} Rahat Up. Tüm hakları saklıdır.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`
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
      await monitorService.monitorUpdateAfterTask(monitor);
    }
  } catch (error) {
    console.log(error);
  }
}

async function sendRequest(monitor) {
  let slowResponse = {
    isError: false,
    message: "Response süresi ideal çalışıyor !",
  };
  let responseTime = 0;
  let isError = false;
  let status;
  const startTime = Date.now();
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
    responseTime = Date.now() - startTime;
    if (monitor.slowResponseAlertStatus) {
      if (monitor.slowResponseAlertValue < responseTime) {
        slowResponse.isError = true;
        slowResponse.message = "Response süresi beklentinizin üzerinde !";
      }
    }
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
        slowResponse: slowResponse,
      };
    } else {
      status = response.status;
      return {
        status: status,
        responseTime,
        isError,
        message: isError ? "unsuccess" : "success",
        slowResponse: slowResponse,
      };
    }
  } catch (error) {
    responseTime = Date.now() - startTime;
    if (monitor.slowResponseAlertStatus) {
      if (monitor.slowResponseAlertValue < responseTime) {
        slowResponse.isError = true;
        slowResponse.message = "Response süresi beklentinizin üzerinde !";
      }
    }
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
  } finally {
    return {
      status: status || 0,
      responseTime,
      isError,
      message: isError ? "unsuccess" : "success",
      slowResponse: slowResponse,
    };
  }
}

module.exports = {
  monitorTask,
  sendRequest,
};
