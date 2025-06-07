const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: Number, required: true },   // ID nga PostgreSQL (user)
  eventId: { type: Number, required: true },  // ID nga PostgreSQL (event)
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },  // boolean flag për leximin
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
