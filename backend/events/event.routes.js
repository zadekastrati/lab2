// routes/event.routes.js
const express = require('express');
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('./event.controller');

router.post('/', createEvent);

router.get('/', getAllEvents);

router.get('/:id', getEventById);

router.put('/:id', updateEvent);

router.delete('/:id', deleteEvent);

module.exports = router;
