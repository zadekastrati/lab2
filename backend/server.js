const express = require("express");
<<<<<<< HEAD
const http = require("http"); 
const socketIo = require("socket.io");  
const app = express();
require('dotenv').config(); 

require('./config/db.js');
const connectMongo = require('./config/mongo.js');
connectMongo();

const cors = require('cors');

const userRoutes = require('./users/user.routes.js');
const eventRoutes = require('./events/event.routes');
const questionRoutes = require('./questions/routes/question.routes');
const chatRoutes = require('./livechat/chat.routes.js');
const categoryRoutes = require('./categories/category.routes');

const notificationRoutes = require('./notifications/notification.routes.js');

const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: 'http://localhost:5000',
=======
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const multer = require("multer");
const cors = require("cors");
require("dotenv").config();

require("./config/db.js");
const connectMongo = require("./config/mongo.js");
connectMongo();

const userRoutes = require("./users/user.routes.js");
const eventRoutes = require("./events/event.routes");
const questionRoutes = require("./questions/routes/question.routes");
const chatRoutes = require("./livechat/chat.routes.js");
const categoryRoutes = require("./categories/category.routes");

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: "http://localhost:3000",
>>>>>>> 11672c1ac9190917f70981c9951eba0e8300595d
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const server = http.createServer(app);
const io = socketIo(server, { cors: corsOptions });

const handleChatSocket = require("./livechat/chat.socket.js");
handleChatSocket(io); 

app.use(cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 

app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
<<<<<<< HEAD
}); 

// 📦 Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/categories', categoryRoutes);

app.use('/api/notifications', notificationRoutes);
=======
});
>>>>>>> 11672c1ac9190917f70981c9951eba0e8300595d

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
