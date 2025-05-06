const express = require("express");
const http = require("http"); 
const socketIo = require("socket.io"); // Import socket.io  
const app = express();
require('dotenv').config(); 
require('./config/db.js');
const cors = require('cors');
const userRoutes = require('./users/user.routes.js');
const eventRoutes = require('./events/event.routes');
const questionRoutes = require('./questions/routes/question.routes.js');

const PORT = process.env.PORT || 5000;

// ✅ CORS setup
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const server = http.createServer(app); // Create a server with Express and HTTP
const io = socketIo(server, { cors: corsOptions }); // Attach Socket.IO to the server


app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
}); 

app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/questions', questionRoutes);

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for chat messages from clients
  socket.on("chatMessage", (msg) => {
    console.log("Message received: " + msg);
    // Emit the message to all connected clients
    io.emit("chatMessage", msg);
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
