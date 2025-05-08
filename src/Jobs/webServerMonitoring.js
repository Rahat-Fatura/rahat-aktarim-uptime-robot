const cron = require('node-cron');
const { monitorService } = require('../services/');
const amqplib = require('amqplib');

const webServerMonitoring = async()=>{
  let channel;
  try{
    const connection = await amqplib.connect("amqp://localhost:5672");
    channel = await connection.createChannel();
    await channel.assertQueue("webServerQueue");

    return cron.schedule('*/3 * * * * *', async () => {
      console.log('Web Server Monitoring job started');
      const monitors = await monitorService.runJob();
      console.log(monitors);
      if(monitors){
        monitors.map(monitor =>{
          channel.sendToQueue("webServerQueue", Buffer.from(JSON.stringify(monitor)));
        })
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
    webServerMonitoring,
};