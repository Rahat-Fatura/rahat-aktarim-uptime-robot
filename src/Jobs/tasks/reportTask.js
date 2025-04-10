/* eslint-disable no-param-reassign */
/* eslint-disable prettier/prettier */
/* eslint-disable no-nested-ternary */
/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
/* eslint-disable prettier/prettier */
const { monitorService, monitorLogService, emailService } = require('../../services');

function generateReport(logs) {
  if (logs.length === 0) return null;

  const totalRequests = logs.length;
  const failedRequests = logs.filter((log) => log.isError).length;
  const successRequests = totalRequests - failedRequests;

  const avgResponseTime = logs.reduce((acc, log) => acc + log.responseTime, 0) / totalRequests;

  return {
    totalRequests,
    successRequests,
    failedRequests,
    avgResponseTime: Math.round(avgResponseTime),
    successRate: `${((successRequests / totalRequests) * 100).toFixed(2)}%`,
  };
}

async function reportTask(monitor) {
  const controlMonitor = await monitorService.getMonitorById(monitor.id, true);
  const user = controlMonitor.server_owner;
  const logs = await monitorLogService.getLogsByTime(monitor.id, monitor.report_time, monitor.reportTimeUnit);
  const report = generateReport(logs);
  const subject = `${monitor.name} için ${monitor.report_time} ${monitor.reportTimeUnit} Raporunuz`;
  const text = `
    Merhaba,

    İşte ${monitor.name} için son ${monitor.report_time} ${monitor.reportTimeUnit} içindeki sunucu istek raporunuz:

    - Toplam istek sayısı: ${report.totalRequests || 0}
    - Başarılı istek sayısı: ${report.successRequests || 0}
    - Hatalı istek sayısı: ${report.failedRequests || 0}
    - İsteklerin ortalama yanıt süresi: ${report.avgResponseTime || 0} ms
    - Başarı Oranı: ${report.successRate || '0.00%'}

    İyi günler dileriz!
  `;
  await emailService.sendEmail(
    `<${user.email}>`,
    subject,
    text,
  )
}

module.exports = {
  reportTask,
};