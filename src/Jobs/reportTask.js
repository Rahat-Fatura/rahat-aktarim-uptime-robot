/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
/* eslint-disable prettier/prettier */
const { monitorService, monitorLogService, emailService } = require('../services');

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
  const subject = `${monitor.name} için ${monitor.report_time} ${monitor.reportTimeUnits} Raporunuz`;
  const text = `
    Merhaba,

    İşte ${monitor.name} için son ${monitor.report_time} ${monitor.reportTimeUnits} içindeki sunucu istek raporunuz:

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

const reportExprension = (report_time, reportTimeUnit) => {
  // eslint-disable-next-line default-case
  switch (reportTimeUnit) {
    case 'hours': {
      if (report_time > 24) {
        return `0 0 * * *`;
      }
      if (report_time < 1) {
        return '0 */59 * * * *';
      }
      return `0  0 */${report_time} * *`;
    }
    case 'days': {
      if (report_time > 30) {
        return `0 0 0 1 * *`;
      }
      if (report_time < 1) {
        return '0 0 */23 * * *';
      }
      return `0 0 0 */${report_time} * *`;
    }
    case 'weeks': {
      if (report_time > 3) {
        return `0 0 0 1 * *`;
      }
      if (report_time < 1) {
        return `0 0 0 */6 * *`;
      }
      return `0 0 0 */${report_time*7} * *`;
    }
    case 'months': {
      if (report_time > 12) {
        return `0 0 0 1 1 *`;
      }
      if (report_time < 1) {
        return `0 0 0 1 * *`;
      }
      return `0 0 0 1 */${report_time} *`;
    }
  }
};

module.exports = {
  reportTask,
  reportExprension,
};