const Ticket = require('./ticket.model');
const Event = require('../events/event.model');
const User = require('../users/user.model');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

exports.buyTicket = async (req, res) => {
  try {
    console.log('req.user:', req.user); // ✅ this will show the entire user object
    const userId = req.user.userId;
    console.log('userId:', userId); 
    const { eventId, ticket_type = 'General' } = req.body;

    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const qrString = `TICKET-${eventId}-${userId}-${Date.now()}`;
    const qrCode = await QRCode.toDataURL(qrString);

    const ticket = await Ticket.create({
      userId,
      eventId,
      ticket_type,
      price: event.price,
      qrCode,
      status: 'active',
      purchase_date: new Date(),
    });
  

    // Setup email transporter (use real SMTP in production)
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✔️ exists' : '❌ missing');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // or use env variable
      },
    });

    await transporter.sendMail({
      from: '"Modern Ticketing" <your_email@gmail.com>',
      to: user.email,
      subject: 'Your Ticket Purchase Confirmation',
      html: `
        <h3>Thanks for your purchase, ${user.name}!</h3>
        <p><strong>Event:</strong> ${event.name}</p>
        <p><strong>Date:</strong> ${event.date}</p>
        <p><strong>Location:</strong> ${event.location}</p>
        <p><strong>Type:</strong> ${ticket.ticket_type}</p>
        <p><strong>Price:</strong> £${ticket.price}</p>
        <p><strong>QR Code:</strong></p>
        <img src="${qrCode}" alt="QR Code" />
      `,
    });

    return res.status(201).json({ ticket, message: 'Ticket purchased and email sent.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error buying ticket' });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Event, attributes: ['id', 'name', 'date'] }
      ]
    });
    res.status(200).json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tickets' });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findByPk(ticketId, {
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Event, attributes: ['id', 'name', 'date'] }
      ]
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching ticket' });
  }
};

exports.markTicketUsed = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.used) {
      return res.status(400).json({ message: 'Ticket already used' });
    }

    ticket.used = true;
    ticket.status = 'used';
    await ticket.save();

    res.status(200).json({ message: 'Ticket marked as used', ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating ticket status' });
  }
};

