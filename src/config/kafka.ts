const { Kafka } = require("kafkajs");

export const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["broker:29092"],
});


