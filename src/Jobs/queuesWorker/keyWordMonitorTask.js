const getRabbitConnection = require('../rabbitConnection');
const { keyWordTask } = require('../tasks/keyWordTask');

const keyWordMonitorTask = async() =>{
    try{
        const queueName = 'keyword_monitor_queue';
        const connection = await getRabbitConnection();
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