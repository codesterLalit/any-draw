const { kafka } = require("./client");

exports.initConsumer = async function(group) {
  var consumer = kafka.consumer({ groupId: group });
  await consumer.connect();

  await consumer.subscribe({ topics: ["drawing-updates"], fromBeginning: false });
  return consumer;
};