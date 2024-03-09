const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { createClient } = require('redis');
const { initProducer, sendData } = require('./producer');
const { initConsumer } = require('./consumer');


const PORT = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });
app.use(cors());

// Serve static files from the public directory
app.use(express.static('public'));

// Socket.IO connection handling
function findKeysByValue(obj, value) {
  let keys = [];
  
  // Check if obj is null or undefined
  if (!obj || typeof obj !== 'object') {
    return keys;
  }

  // Convert object to Map
  let map = new Map(Object.entries(obj));

  // Iterate over entries of the map
  for (let [key, val] of map) {
    if (val === value) {
      keys.push(key);
    }
  }
  return keys;
}


const serverStart =  async () =>{
  let consumer = await initConsumer('backend');
  initProducer();
  const client = await createClient().on('error', err => console.log('Redis Client Error', err))
  .connect();
  await client.flushAll()
  

  io.on('connection', async (socket) => {
  
    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log('inside disconnect');
      await client.hDel('user_list', socket.id)
      return
    });
  
    socket.on('add-user', async (data) => {
      try {
        let socketId = socket.id;
        let userName = data.userName;
  
        console.log('inside add-user');
        await client.hSet('user_list', socketId, userName)
        let allList = await client.hGetAll('user_list')
        await io.emit('available-user', allList)
        return socket.emit('name-added', { msg: "User added" })
      } catch (error) {
        socket.emit("error", { msg: "Error found." })
      }
    }
    )
  
    socket.on('startDrawing', (data) => {
      let dataToPush = { ...data, drawBy: socket.id, eventType: "startDrawing" }
      sendData(dataToPush)
      return
    })
  
    socket.on('finishDrawing', (data) => {
      let dataToPush = { ...data, drawBy: socket.id, eventType: "finishDrawing" }
      sendData(dataToPush)
      return
    })
  
    socket.on('draw', (data) => {
      let dataToPush = { ...data, drawBy: socket.id, eventType: "draw" }
      sendData(dataToPush)
      return
    })
  
  
    socket.on('listen-artist', async (data) => {
      console.log('inside listen-artist');
      if(!data){
        socket.emit("error", { msg: "data artist payload error" })
        return
      }
      if(data.artist == '' || !data.artist){
        await client.hDel('listen_list', socket.id)
        socket.emit("error", { msg: "artist payload error " })
        return
      }
      if(!socket.id && !data.artist){
        socket.emit("error", { msg: "error message" })
        return
      }
      await client.hSet('listen_list', socket.id, data.artist)
      return
    })
  
  
    // onKafka.event(()=>{
    //   let emitter = "test"
    //   let socketObj = await client.hGetAll('listen_list')
  
    // })
  
  });
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  
  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      message = JSON.parse(message.value)
      let drawer = message.drawBy;
      console.log('inside each message', message);
      let listen = await client.hGetAll('listen_list')

      let listener = findKeysByValue(listen, drawer)
      let eventType = message.eventType;
      if(listener.length > 0){
        console.log("listerners===> ", listener)
        console.log("event-type ===>", eventType)
        switch (eventType) {
          case "startDrawing":
            io.to(listener).emit("startDrawing-listen", message)
            break;
  
          case "finishDrawing":
            io.to(listener).emit("finishDrawing-listen", message)
            break;
  
          case "draw":
            io.to(listener).emit("draw-listen", message)
            break;
          default:
            break;
        }
      }
    },
  });
}


serverStart()