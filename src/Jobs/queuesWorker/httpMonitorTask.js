const amqplib = require("amqplib");
const { monitorTask } = require("../tasks/monitorTask");

const httpMonitorTask = async() =>{
    try{
        const queueName = 'http_monitor_queue';
        const connection = await amqplib.connect("amqp://localhost:5672");
        const channel = await connection.createChannel();
        //await channel.deleteQueue(queueName);
        const assertion = await channel.assertQueue(queueName);
        channel.consume(queueName, monitor =>{
            channel.ack(monitor);
            monitorTask(JSON.parse(monitor.content.toString()));
        })
    }
    catch(error){
        console.error(error)
    }
    
} 




module.exports={
    httpMonitorTask,
}