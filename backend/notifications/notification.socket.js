const Notification = require('./notification.model');

function setupNotificationSocket(io) {
  io.on('connection', (socket) => {
    console.log(`Socket ${socket.id} connected`);

    socket.on('joinRoom', (userId) => {
      socket.join(userId.toString());
      console.log(`Socket ${socket.id} joined room of user ${userId}`);
    });

    socket.on('createNotification', async (data) => {
      try {
        const { userId, eventId, message } = data;
        if (!userId || !eventId || !message) {
          return socket.emit('error', 'userId, eventId dhe message janë të nevojshme');
        }
        const notification = new Notification({ userId, eventId, message });
        const saved = await notification.save();

        io.to(userId.toString()).emit('notification', saved);
      } catch (err) {
        console.error('Gabim në krijimin e njoftimit:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket ${socket.id} disconnected`);
    });
  });
}

module.exports = setupNotificationSocket;
 