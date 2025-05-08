const amqplib = require("amqplib");
const { monitorTask } = require("./tasks/monitorTask");

const webServerJob = async() =>{
    try{
        const connection = await amqplib.connect("amqp://localhost:5672");
        const channel = await connection.createChannel();
        const assertion = await channel.assertQueue("webServerQueue");
        console.log("webMonitörler bekleniyor ....");
        channel.consume("webServerQueue", monitor =>{
            console.log("************************")
            monitorTask(JSON.parse(monitor.content.toString()));
            channel.ack(monitor);
        })
    }
    catch(error){
        console.error(error)
    }
    
} 




module.exports={
    webServerJob
}