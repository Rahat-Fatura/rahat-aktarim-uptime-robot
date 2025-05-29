const amqplib = require("amqplib");
const { keyWordTask } = require('../tasks/keyWordTask');

const keyWordMonitorTask = async() =>{
    try{
        const queueName = 'keyword_monitor_queue';
        const connection = await amqplib.connect("amqp://localhost:5672");
        const channel = await connection.createChannel();
        //await channel.deleteQueue(queueName);
        const assertion = await channel.assertQueue(queueName);
        channel.consume(queueName, monitor =>{
            channel.ack(monitor);
            keyWordTask(JSON.parse(monitor.content.toString()));
        })
    }
    catch(error){
        console.error(error)
    }
} 


module.exports={
    keyWordMonitorTask,
}