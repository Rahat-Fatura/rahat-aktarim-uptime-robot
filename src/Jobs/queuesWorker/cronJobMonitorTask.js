const amqplib = require("amqplib");
const { cronJobTask } = require("../tasks/cronJobTask");

const cronJobMonitorTask = async() =>{
    try{
        const queueName = 'cron_job_monitor_queue';
        const connection = await amqplib.connect("amqp://localhost:5672");
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