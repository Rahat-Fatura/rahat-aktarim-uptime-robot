const cron = require('node-cron');
const { monitorService } = require('../services');
const amqplib = require('amqplib');

const renderMonitor = async()=>{
  let channel;
  try{
    const connection = await amqplib.connect("amqp://localhost:5672");
    channel = await connection.createChannel();
    //await channel.deleteQueue("monitor_parser_queue")
    await channel.assertQueue("monitor_parser_queue");
    return cron.schedule('*/5 * * * * *', async () => {
      const monitors = await monitorService.runJob();
      if(monitors){
        channel.sendToQueue("monitor_parser_queue", Buffer.from(JSON.stringify(monitors)));
      }
    },{
      scheduled: true
    });
  }
  catch(error)
  {
    console.log(error);
  }
  
} 


module.exports = {
    renderMonitor,
};