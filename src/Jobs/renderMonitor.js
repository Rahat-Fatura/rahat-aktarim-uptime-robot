const cron = require('node-cron');
const { monitorService } = require('../services');
const getRabbitConnection = require('./rabbitConnection');

function calculateInitialDelay() {
  const now = new Date();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();
  const remainder = seconds % 5;
  const delay = ((5 - remainder) % 5) * 1000 - milliseconds;
  return delay >= 0 ? delay : 0;
}

const renderMonitor = async()=>{
  let channel;
  try{
    const connection = await getRabbitConnection();
    channel = await connection.createChannel();
    //await channel.deleteQueue("monitor_parser_queue")
    await channel.assertQueue("monitor_parser_queue");
    const task = cron.schedule('*/5 * * * * *', async () => {
     
      const monitors = await monitorService.runJob();
      if(monitors){
        channel.sendToQueue("monitor_parser_queue", Buffer.from(JSON.stringify(monitors)));
      }
    },{
      scheduled: false
    });

  const delay = calculateInitialDelay();
  console.log(`Cron görevi ${delay} ms sonra başlatılacak (senkronize başlangıç)`);

  setTimeout(() => {
    task.start(); // ilk 0,5,10,... saniyelere denk gelince başlat
    console.log("Cron görevi senkronize şekilde başlatıldı.");
  }, delay);
  }
  catch(error)
  {
    console.log(error);
  }
  
} 


module.exports = {
    renderMonitor,
};