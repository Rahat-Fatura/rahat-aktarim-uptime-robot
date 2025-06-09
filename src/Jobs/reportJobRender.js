const cron = require("node-cron");
const { monitorService } = require("../services/");
const amqplib = require("amqplib");

const reportJobRender = async () => {
  let channel;
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    channel = await connection.createChannel();
    //await channel.deleteQueue("monitor_report_queue")
    await channel.assertQueue("monitor_report_queue");
    return cron.schedule("0 */1 * * * *", async () => {
      console.log("Report job render started");
      const monitors = await monitorService.reportRender();
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
