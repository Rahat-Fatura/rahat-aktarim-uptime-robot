const amqplib = require('amqplib');

let connection = null;


const getRabbitConnection = async () => {
  if (!connection) {
    console.log("🐇 Bağlanılıyor...");
    connection = await amqplib.connect("amqp://localhost:5672");
    connection.on('close', () => {
      console.log('❌ Bağlantı koptu');
      connection = null;
    });
  }
  return connection;
};



module.exports = getRabbitConnection;
