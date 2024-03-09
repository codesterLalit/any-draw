var kafka = require("./client").kafka;
var producer = kafka.producer();

exports.initProducer = async function() {
  console.log("Connecting Producer");
  await producer.connect();
};

exports.sendData = async function(data) {
  try {
   let objs =  JSON.stringify(Object.assign({}, data, { timestamp: new Date().getTime() }))

    await producer.send({
      topic: "drawing-updates",
      messages: [
        {
          key: "drawing-updates",
          value: objs
        }
      ]
    });
  } catch (error) {
    console.log(error);
  }
};

exports.disconnectProducer = async function() {
  try {
    await producer.disconnect();
    return true;
  } catch (error) {
    return false;
  }
};