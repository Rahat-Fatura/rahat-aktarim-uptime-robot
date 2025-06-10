const amqplib = require("amqplib");
const { pingTask } = require("../tasks/pingTask");

const pingMonitorTask = async() =>{
    try{
        const queueName = 'ping_monitor_queue';
        const connection = await amqplib.connect("amqp://localhost:5672");
        const channel = await connection.createChannel();
        //await channel.deleteQueue(queueName);
        const assertion = await channel.assertQueue(queueName);
        channel.consume(queueName, monitor =>{
            channel.ack(monitor);
            console.log(JSON.parse(monitor.content.toString()))
            pingTask(JSON.parse(monitor.content.toString()));
        })
    }
    catch(error){
        console.error(error)
    }
} 


module.exports={
    pingMonitorTask,
}