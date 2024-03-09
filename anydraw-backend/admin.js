const { kafka } = require("./client");

async function init() {
  const admin = kafka.admin();
  console.log("Admin connecting...");
  await admin.connect(); // Await the connect() method
  console.log("Admin Connection Success...");

  console.log("Creating Topic [rider-updates]");
  try {
    let topics = await admin.listTopics()
    console.log('topics-->', topics)
    await admin.createTopics({
      topics: [
        {
          topic: "drawing-updates",
          numPartitions: 2,
        },
      ],
    });
    console.log("Topic Created Successfully [rider-updates]");
  } catch (error) {
    console.error("Error creating topic:", error);
  }

  console.log("Disconnecting Admin..");
  await admin.disconnect();
}

init();
