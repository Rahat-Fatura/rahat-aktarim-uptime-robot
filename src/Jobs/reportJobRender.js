const cron = require("node-cron");
const { monitorService } = require("../services/");
const getRabbitConnection = require('./rabbitConnection');

const reportJobRender = async () => {
  let channel;
  try {
    const connection = await getRabbitConnection();
    channel = await connection.createChannel();
    //await channel.deleteQueue("monitor_report_queue")
    await channel.assertQueue("monitor_report_queue");
    return cron.schedule("0 */1 * * * *", async () => {
      const now = new Date();
      console.log("Report job render started at:", now.toISOString());
      console.log("Report job render started");
      const monitors = await monitorService.reportRender();
      console.log("Monitors for report:", monitors);
      if(monitors){
        monitors.map(monitor =>{
            channel.sendToQueue("monitor_report_queue", Buffer.from(JSON.stringify(monitor)));
        })
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  reportJobRender,
};
