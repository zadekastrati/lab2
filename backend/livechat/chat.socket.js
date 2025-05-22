const Chat = require('./chat.model');
const jwt = require('jsonwebtoken');

const userSockets = new Map();   // name -> socket.id
const adminSockets = new Set();  // Set of admin socket IDs
const activeUsers = new Set();   // Store names of users who've sent messages

module.exports = function (io) {
  // Middleware to verify token
  io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (!token) return next(new Error('Authentication error: No token'));

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error: Invalid token'));

      socket.user = decoded; // { userId, name, role }
      next();
    });
  });

  io.on('connection', (socket) => {
    const { userId, name, role } = socket.user;
    console.log(`✅ ${role} connected: ${name} (${userId})`);

    if (role === 'admin') {
      adminSockets.add(socket.id);
      console.log('🧑‍💼 Admin connected:', socket.id);

      // On connection, send current active users list
      socket.emit('userList', Array.from(activeUsers));
    } else {
      userSockets.set(name, socket.id);
      console.log(`👤 User ${name} socket set:`, socket.id);
    }

    // Handle message send
    socket.on('chatMessage', async (msg) => {
      const { sender, receiver, message } = msg;
      const messageData = { sender, receiver, userId, message };

      // Save to DB
      try {
        await new Chat(messageData).save();
        console.log('✅ Message saved to MongoDB:', messageData);
      } catch (err) {
        console.error('❌ Error saving message:', err.message);
      }

      if (role === 'user') {
        activeUsers.add(sender); // Track who sent messages

        // Notify all admins about new user message and updated list
        adminSockets.forEach((adminSocketId) => {
          io.to(adminSocketId).emit('chatMessage', messageData);
          io.to(adminSocketId).emit('userList', Array.from(activeUsers));
        });
      }

      if (role === 'admin') {
        const targetSocketId = userSockets.get(receiver);
        if (targetSocketId) {
          io.to(targetSocketId).emit('chatMessage', messageData);
          console.log(`➡️ Admin sent message to user ${receiver}`);
        } else {
          console.warn(`⚠️ User ${receiver} not connected`);
        }
      }
    });

    // Allow admin to request updated list manually
    socket.on('getUserList', () => {
      if (role === 'admin') {
        socket.emit('userList', Array.from(activeUsers));
      }
    });

    // Cleanup on disconnect
    socket.on('disconnect', () => {
      if (role === 'admin') {
        adminSockets.delete(socket.id);
        console.log('❌ Admin disconnected:', socket.id);
      } else {
        userSockets.delete(name);
        console.log(`❌ User ${name} disconnected:`, name);
      }
    });
  });
};
