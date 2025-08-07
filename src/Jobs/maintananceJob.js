const cron = require("node-cron");
const { maintananceService } = require("../services/");
const { maintananceTasks } = require("./tasks/maintananceTask");
const getRabbitConnection = require('./rabbitConnection');

const maintananceJob = async () => {
  let channel;
  try {
    const connection = await getRabbitConnection();
    channel = await connection.createChannel();
    //await channel.deleteQueue("monitor_parser_queue")
    await channel.assertQueue("monitor_maintanance_queue");
    return cron.schedule("*/5 * * * * *", async () => {
      console.log("Maintanance Task job started");
      const maintanances = await maintananceService.runMaintananceTask();
      console.log("MAintnanannance :", maintanances)
      if(maintanances){
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
