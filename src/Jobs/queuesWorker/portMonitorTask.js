const amqplib = require("amqplib");
const { portTask } = require("../tasks/portTask");

const portMonitorTask = async() =>{
    try{
        const queueName = 'port_monitor_queue';
        const connection = await amqplib.connect("amqp://localhost:5672");
        const channel = await connection.createChannel();
        //await channel.deleteQueue(queueName);
        const assertion = await channel.assertQueue(queueName);
        channel.consume(queueName, monitor =>{
            channel.ack(monitor);
            portTask(JSON.parse(monitor.content.toString()));
        })
    }
    catch(error){
        console.error(error)
    }
} 


module.exports={
    portMonitorTask,
}