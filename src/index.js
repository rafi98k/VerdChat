require("dotenv").config();
const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const {createServer} = require("http");
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');


const app = express();


//Middleware
app.use(cors({
  origin : process.env.CLIENT_URL,
  credentials : true,
}));

app.use(express.json());
app.use(cookieParser());


//Routers
const pagesRouter = require("./routes/pages.js");
const authRouter = require("./routes/auth.js");
const roomsRouter = require('./routes/rooms');


//static files
app.use(express.static(path.join(__dirname, '../public')));




//routes
app.use('/',pagesRouter);
app.use('/api/auth',authRouter);
app.use('/api/rooms',roomsRouter);

//WebSocket
const wss = new WebSocket.Server({port : 8000});
console.log('WebSocket server is running on ws://localhost:8000');

wss.on('connection',(ws)=>{
  console.log('new client has joined');

  //ws.send("welcome to the WebSocket server");

  ws.on('message',(message)=>{
    const data = JSON.parse(message.toString());

    wss.clients.forEach((client) => {
      if (client!== ws && client.readyState === WebSocket.OPEN) {
        console.log(client);
        client.send(JSON.stringify(data));
      }
    });
    
  });
  ws.on('close',()=>{
    console.log('Client disconnected');
  });
  
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on porttt ${PORT}`);
});

