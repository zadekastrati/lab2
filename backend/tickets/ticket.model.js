const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('../users/user.model');
const Event = require('../events/event.model');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ticket_type: {
    type: DataTypes.STRING(50), // e.g., VIP, General, Child
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  qrCode: {
    type: DataTypes.TEXT, // Can store base64 or URL
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'used', 'cancelled'),
    defaultValue: 'active',
  },
  purchase_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'tickets',
  timestamps: true,
});

// Associations
Ticket.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Ticket, { foreignKey: 'userId' });

Ticket.belongsTo(Event, { foreignKey: 'eventId' });
Event.hasMany(Ticket, { foreignKey: 'eventId' });

module.exports = Ticket;
