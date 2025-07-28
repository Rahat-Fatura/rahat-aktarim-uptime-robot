const getRabbitConnection = require('../rabbitConnection');
const { cronJobTask } = require("../tasks/cronJobTask");

const cronJobMonitorTask = async() =>{
    try{
        const queueName = 'cron_job_monitor_queue';
        const connection = await getRabbitConnection();
        const channel = await connection.createChannel();
        //await channel.deleteQueue(queueName);
        const assertion = await channel.assertQueue(queueName);
        channel.consume(queueName, monitor =>{
            channel.ack(monitor);
            cronJobTask(JSON.parse(monitor.content.toString()));
        })
    }
    catch(error){
        console.error(error)
    }
    
} 




module.exports={
    cronJobMonitorTask,
}