const Event = require('./event.model');

// Create Event
const createEvent = async (req, res) => {
  try {
    const { name, photo, date, location, price } = req.body;

    const newEvent = await Event.create({ name, photo, date, location, price });
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};

// Get All Events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll();
    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

// Get Event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ event });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
};

// Update Event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, photo, date, location, price } = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.name = name || event.name;
    event.photo = photo || event.photo;
    event.date = date || event.date;
    event.location = location || event.location;
    event.price = price || event.price;

    await event.save();

    res.status(200).json({ message: 'Event updated successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
};

// Delete Event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.destroy();

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
