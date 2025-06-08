const Notification = require('./notification.model');
const Event = require('../events/event.model.js'); 

exports.getNotificationsByUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // Merr njoftimet nga MongoDB (njoftime me userId)
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    // Merr eventId-te nga njoftimet
    const eventIds = notifications.map(n => n.eventId);

    // Merr eventet nga PostgreSQL
    const events = await Event.findAll({
      where: { id: eventIds },
      raw: true,
    });

    // Map njoftimet me eventin përkatës
    const notificationsWithEvents = notifications.map(n => {
      const event = events.find(e => e.id === n.eventId);
      return {
        _id: n._id,
        userId: n.userId,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt,
        event: event || null,
      };
    });

    res.json(notificationsWithEvents);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { userId, eventId, message } = req.body;
    if (!userId || !eventId || !message) {
      return res.status(400).json({ message: 'userId, eventId dhe message janë të nevojshme' });
    }

    const notification = new Notification({ userId, eventId, message });
    const savedNotification = await notification.save();

    res.status(201).json(savedNotification);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Njoftimi nuk u gjet' });

    res.json(updated);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const deleted = await Notification.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Njoftimi nuk u gjet për fshirje' });

    res.json({ message: 'Njoftimi u fshi me sukses' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
