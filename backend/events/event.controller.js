const Event = require('./event.model');
const { Op } = require('sequelize');

// Create Event
const createEvent = async (req, res) => {
  try {
    const { name, date, location, price, categoryId } = req.body;
    const photo = req.file ? req.file.filename : null;

    if (!name || !date || !location || !price || !categoryId || !photo) {
      return res.status(400).json({ message: 'All fields including photo are required.' });
    }

    const newEvent = await Event.create({
      name,
      photo,
      date,
      location,
      price,
      categoryId,
    });

    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const { search, categoryId } = req.query;
    let whereClause = {};

    if (search && categoryId) {
      whereClause = {
        [Op.and]: [
          {
            [Op.or]: [
              { name: { [Op.iLike]: `%${search}%` } },
              { location: { [Op.iLike]: `%${search}%` } }
            ]
          },
          { categoryId: categoryId }
        ]
      };
    } else if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { location: { [Op.iLike]: `%${search}%` } }
        ]
      };
    } else if (categoryId) {
      whereClause = { categoryId: categoryId };
    }

    const events = await Event.findAll({
      where: whereClause,
      order: [['date', 'ASC']],
    });

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
    const { name, date, location, price, categoryId } = req.body;
    const photo = req.file ? req.file.filename : undefined;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Update only provided fields
    if (name) event.name = name;
    if (photo) event.photo = photo;
    if (date) event.date = date;
    if (location) event.location = location;
    if (price) event.price = price;
    if (categoryId) event.categoryId = categoryId;

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