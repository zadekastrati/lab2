// In livechat/chat.routes.js (create this file)
const express = require('express');
const router = express.Router();
const ChatMessage = require('./chat.model');

router.get('/messages', async (req, res) => {
  try {
    const messages = await ChatMessage.find().sort({ timestamp: 1 }).limit(100); // last 100 messages, oldest first
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

module.exports = router;
