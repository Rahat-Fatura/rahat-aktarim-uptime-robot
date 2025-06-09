
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

function generateReportCollective(monitors){
  console.log("monitors is type of", Array.isArray(monitors));
  const report = monitors.map((monitor) => {
    const logs =generateReport(monitor.logs);
    return {
      id: monitor.id,
      name: monitor.name,
      host: monitor.host,
      isActiveByOwner: monitor.isActiveByOwner,
      logs
    };
  })
  console.log(report);
  return report;
}
 
async function reportTask(monitor) {
  const controlMonitor = await monitorService.getMonitorById(monitor.id, true);
  let beforeMonth = new Date(monitor.reportTime);
  beforeMonth.setMonth(beforeMonth.getUTCMonth-1);
  const user = controlMonitor.serverOwner;
  const logs = await monitorLogService.getLogsByTime(monitor.id);
  const report = generateReport(logs);
  console.log(report) 
  const subject = `${monitor.name} için ${beforeMonth.toDateString()} ${monitor.reportTime} Raporunuz`;
  const text = `
      Merhaba,
  
      İşte ${monitor.name} için son ${monitor.reportTime} ${monitor.reportTimeUnit} içindeki sunucu istek raporunuz:
  
      - Toplam istek sayısı: ${report ? report.totalRequests : 0}
      - Başarılı istek sayısı: ${report ? report.successRate : 0}
      - Hatalı istek sayısı: ${report ? report.failedRequests : 0 }
      - İsteklerin ortalama yanıt süresi: ${report ? report.avgResponseTime : 0} ms
      - Başarı Oranı: ${report? report.successRate : '0.00%'} 
  
      İyi günler dileriz! 
    `;
    console.log("Mail gönderildi ",text);
    try{
      await emailService.sendEmail(
      `<${user.email}>`,
      subject,
      text,
      )
    }
    catch(error){
      console.log(error)
    }
    
    console.log("Helo")
  let now = new Date();
  now.setMonth(now.getUTCMonth());
  await monitorService.updateMonitorById(monitor.id,{
    reportTime: now
  });
}

module.exports = {
  reportTask,
  generateReport,
  generateReportCollective,
};