const amqplib = require("amqplib");
const { reportTask } = require('./tasks/reportTask');

const reportTaskWorker = async() => {
    let channel;
    try{
        const connect = await amqplib.connect("amqp://localhost:5672");
        channel = await connect.createChannel();
        await channel.assertQueue("monitor_report_queue");
        channel.consume("monitor_report_queue",(monitor) =>{
            console.log(JSON.parse(monitor.content.toString()));
            channel.ack(monitor);
            reportTask(JSON.parse(monitor.content.toString()));
        })
    }
    catch(error){
      console.log(error);
    }
}


module.exports = {
    reportTaskWorker
}