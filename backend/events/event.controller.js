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
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const { search } = req.query;
    console.log('Search query:', search); // Debug log

    let whereClause = {};

    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { location: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    console.log('Where clause:', JSON.stringify(whereClause, null, 2)); // Debug log

    const events = await Event.findAll({
      where: whereClause
    });

    console.log('Found events:', events.length); // Debug log
    console.log('Events:', JSON.stringify(events, null, 2)); // Debug log

    res.status(200).json({ events });
  } catch (error) {
    console.error('Error in getAllEvents:', error); // Debug log
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

// Get Event by ID (include categoryId)
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // If ID is not numeric, treat it as a search term
    if (!/^\d+$/.test(id)) {
      const events = await Event.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${id}%` } },
            { location: { [Op.like]: `%${id}%` } }
          ]
        }
      });
      
      if (!events || events.length === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      // Return the first matching event
      return res.status(200).json({ event: events[0] });
    }

    // If ID is numeric, find by primary key
    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ event });
  } catch (error) {
    console.error('Error in getEventById:', error);
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
};

// Update Event (including categoryId)
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, photo, date, location, price, categoryId } = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.name = name || event.name;
    event.photo = photo || event.photo;
    event.date = date || event.date;
    event.location = location || event.location;
    event.price = price || event.price;
    event.categoryId = categoryId || event.categoryId;

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