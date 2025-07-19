const cron = require("node-cron");
const { maintananceService } = require("../services/");
const { maintananceTasks } = require("./tasks/maintananceTask");
const amqplib = require("amqplib");

const maintananceJob = async () => {
  let channel;
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    channel = await connection.createChannel();
    //await channel.deleteQueue("monitor_parser_queue")
    await channel.assertQueue("monitor_maintanance_queue");
    return cron.schedule("0 */1 * * * *", async () => {
      console.log("Maintanance Task job started");
      const maintanances = await maintananceService.runMaintananceTask();
      console.log("MAintnanannance :", maintanances)
      if(maintanances){
       // console.log(maintanances)
        maintanances.map(maintanance =>{
            channel.sendToQueue("monitor_maintanance_queue", Buffer.from(JSON.stringify(maintanance)));
        })
      }
    });
  } catch (error) {
    console.log("Buruuruurfrfnrjnf   JOOOOB")
    console.log(error);
  }
};

module.exports = {
  maintananceJob,
};
