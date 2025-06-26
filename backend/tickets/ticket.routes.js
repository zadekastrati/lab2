const express = require('express');
const router = express.Router();
const ticketController = require('./ticket.controller');
const authenticate = require('../users/middleware/jwtMiddleware');

console.log('ticketController.getTicketById:', ticketController.getTicketById);
// POST /api/tickets/buy
router.post('/buy', authenticate, ticketController.buyTicket);

// 👇 move this first
router.get('/', authenticate, ticketController.getAllTickets);

// 👇 this should come after
router.get('/:ticketId', authenticate, ticketController.getTicketById);

router.put('/:ticketId/use', authenticate, ticketController.markTicketUsed);


module.exports = router;
