    const express = require('express');
    const router = express.Router();
    const ChatMessage = require('./chat.model');
    const authMiddleware = require('../users/middleware/jwtMiddleware');

    // GET MESSAGES - fetch messages from the logged-in user
    router.get('/messages', authMiddleware, async (req, res) => {
        try {
        const { userId, name, role } = req.user;
        const { chatWith } = req.query; // Pass ?chatWith=username from frontend when admin
    
        let query;
    
        if (role === 'admin') {
            if (!chatWith) {
            return res.status(400).json({ error: 'Admin must specify a user to fetch messages with (chatWith).' });
            }
    
            query = {
            $or: [
                { sender: 'admin', receiver: chatWith },
                { sender: chatWith, receiver: 'admin' },
            ],
            };
        } else {
            query = {
            $or: [
                { sender: name, receiver: 'admin' },
                { sender: 'admin', receiver: name },
            ],
            };
        }
    
        const messages = await ChatMessage.find(query)
            .sort({ timestamp: 1 })
            .limit(100);
    
        res.json(messages);
        } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ error: 'Failed to load messages' });
        }
    });

    // GET all users admin has chatted with
    router.get('/chat-users', authMiddleware, async (req, res) => {
        try {
        const { role } = req.user;
    
        if (role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can fetch chat users' });
        }
    
        const users = await ChatMessage.aggregate([
            {
            $match: {
                $or: [
                { sender: 'admin' },
                { receiver: 'admin' }
                ]
            }
            },
            {
            $project: {
                user: {
                $cond: [
                    { $eq: ['$sender', 'admin'] },
                    '$receiver',
                    '$sender'
                ]
                }
            }
            },
            {
            $group: {
                _id: '$user'
            }
            }
        ]);
    
        const userList = users.map(u => u._id);
        res.json(userList);
    
        } catch (err) {
        console.error('Error fetching chat users:', err);
        res.status(500).json({ error: 'Failed to fetch chat user list' });
        }
    });
    
    // POST MESSAGE - send a new message
    router.post('/messages', authMiddleware, async (req, res) => {
        try {
          const userId = req.user.userId; // Authenticated user's ID
          const { message, sender, receiver } = req.body;
      
          if (!message || !sender || !receiver) {
            return res.status(400).json({ error: 'Message, sender, and receiver are required' });
          }
      
          const newMessage = new ChatMessage({
            userId,
            sender,
            receiver,
            message,
            timestamp: new Date(),
          });
      
          await newMessage.save();
      
          console.log('Saved new message:', newMessage);
      
          res.status(201).json(newMessage);
        } catch (err) {
          console.error('Error saving message:', err);
          res.status(500).json({ error: 'Failed to save message' });
        }
      });
      

    module.exports = router;
