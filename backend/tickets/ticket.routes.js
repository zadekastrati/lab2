const express = require('express');
const router = express.Router();
const ticketController = require('./ticket.controller');
const authenticate = require('../users/middleware/jwtMiddleware');

// POST /api/tickets/buy
router.post('/buy', authenticate, ticketController.buyTicket);

// PUT /api/tickets/:ticketId/use
router.put('/:ticketId/use', authenticate, ticketController.markTicketUsed);

module.exports = router;
