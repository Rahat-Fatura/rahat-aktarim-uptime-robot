const amqplib = require("amqplib");

const monitorParser = async () => {
  try {
    const queues = {
      httpMonitor: "http_monitor_queue",
      pingMonitor: "ping_monitor_queue",
      portMonitor: "port_monitor_queue",
      keywordMonitor: "keyword_monitor_queue",
      cronJobMonitor: "cron_job_monitor_queue",
    };
    const connection = await amqplib.connect("amqp://localhost:5672");

    const consumeChannel = await connection.createChannel();
    const producerChannel = await connection.createChannel();
    const assertionConsumer = await consumeChannel.assertQueue(
      "monitor_parser_queue"
    );
    await producerChannel.assertQueue(queues.httpMonitor);
    await producerChannel.assertQueue(queues.pingMonitor);
    await producerChannel.assertQueue(queues.keywordMonitor);
    await producerChannel.assertQueue(queues.portMonitor);
    await producerChannel.assertQueue(queues.cronJobMonitor);
    //await consumeChannel.deleteQueue("monitor_parser_queue");
    //await producerChannel.deleteQueue(queues.httpMonitor);
    //await producerChannel.deleteQueue(queues.pingMonitor);
    consumeChannel.consume("monitor_parser_queue", (monitors) => {
      consumeChannel.ack(monitors);
      monitors = JSON.parse(monitors.content.toString());
      monitors.map((monitor) => {
        switch (monitor.monitorType) {
          case "HttpMonitor": {
            producerChannel.sendToQueue(
              queues.httpMonitor,
              Buffer.from(JSON.stringify(monitor))
            );
            break;
          }
          case "PingMonitor": {
            producerChannel.sendToQueue(
              queues.pingMonitor,
              Buffer.from(JSON.stringify(monitor))
            );
            break;
          }
          case "KeywordMonitor": {
            producerChannel.sendToQueue(
              queues.keywordMonitor,
              Buffer.from(JSON.stringify(monitor))
            );
            break;
          }
          case "PortMonitor": {
            producerChannel.sendToQueue(
              queues.portMonitor,
              Buffer.from(JSON.stringify(monitor))
            );
            break;
          }
          case "CronJobMonitor": {
            producerChannel.sendToQueue(
              queues.cronJobMonitor,
              Buffer.from(JSON.stringify(monitor))
            );
            break;
          }
        }
      });
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  monitorParser,
};
