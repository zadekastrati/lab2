const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const multer = require("multer");
const cors = require("cors");
require("dotenv").config();

require("./config/db.js");
const connectMongo = require("./config/mongo.js");
connectMongo();



const userRoutes = require('./users/user.routes.js');
const eventRoutes = require('./events/event.routes');
const questionRoutes = require('./questions/routes/question.routes');
const chatRoutes = require('./livechat/chat.routes.js');
const categoryRoutes = require('./categories/category.routes');

const notificationRoutes = require('./notifications/notification.routes.js');



const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const server = http.createServer(app);
const io = socketIo(server, { cors: corsOptions });

const handleChatSocket = require("./livechat/chat.socket.js");
handleChatSocket(io); 

const setupNotificationSocket = require('./notifications/notification.socket.js');
setupNotificationSocket(io); // vendos pas setup-it për chat nëse ke


app.use(cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 



// 📦 Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/categories', categoryRoutes);

app.use('/api/notifications', notificationRoutes);
;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
