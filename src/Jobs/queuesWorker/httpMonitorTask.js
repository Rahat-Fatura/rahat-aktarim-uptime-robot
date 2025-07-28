const getRabbitConnection = require('../rabbitConnection');
const { monitorTask } = require("../tasks/monitorTask");

const httpMonitorTask = async() =>{
    try{
        const queueName = 'http_monitor_queue';
        const connection = await getRabbitConnection();
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