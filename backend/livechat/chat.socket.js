const Chat = require('./chat.model');

module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chatMessage', async (msg) => {
      console.log('Message received:', msg);

      // Save full message to MongoDB (with sender + content)
      const chatMessage = new Chat({
        sender: msg.sender,
        message: msg.content,
      });

      await chatMessage.save();

      // Emit to all clients
      io.emit('chatMessage', msg);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
};
