require("dotenv").config();
const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const {createServer} = require("http");
const {Server} = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const httpServer = createServer(app);


//Middleware
app.use(cors());

app.use(express.json());
app.use(cookieParser());


//Routers
const pagesRouter = require("./routes/pages.js");
const authRouter = require("./routes/auth.js");
const roomsRouter = require('./routes/rooms');



//Controllers




//static files
app.use(express.static(path.join(__dirname, '../public')));

const io = new Server(httpServer, {
  cors:{
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials :true,
  },
});






//routes
app.use('/',pagesRouter);
app.use('/api/auth',authRouter);
app.use('/api/rooms',roomsRouter);


//socket.io
io.on('connection', (socket)=>{
  console.log('Client connected', socket.id);

  socket.on('disconnect', () => {
    console.log("client Disconnected" , socket.id);
  });
});



const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
  console.log(`Server running on porttt ${PORT}`);
});

