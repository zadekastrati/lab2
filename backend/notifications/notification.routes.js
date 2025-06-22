const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');

router.get('/:userId', notificationController.getNotificationsByUser);
router.post('/', notificationController.createNotification);
router.put('/read/:id', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
