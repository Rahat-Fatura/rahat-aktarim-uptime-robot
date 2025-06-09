const amqplib = require("amqplib");
const { maintananceTask } = require('./tasks/maintananceTask');

const maintananceWorker = async() => {
    let channel;
    try{
        const connect = await amqplib.connect("amqp://localhost:5672");
        channel = await connect.createChannel();
        await channel.assertQueue("monitor_maintanance_queue");
        channel.consume("monitor_maintanance_queue",(maintanance) =>{
            console.log("bureyye gelende dir")
            
            console.log(JSON.parse(maintanance.content.toString()));
            channel.ack(maintanance);
            maintananceTask(JSON.parse(maintanance.content.toString()));
        })
    }
    catch(error){
    
      console.log(error);
    }
}


module.exports = {
    maintananceWorker
}