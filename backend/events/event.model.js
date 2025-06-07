const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Categories = require('../categories/category.model');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  photo: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Categories,
      key: 'id',
    },
  },
}, {
  tableName: 'events',
  timestamps: true,
});

Categories.hasMany(Event, { foreignKey: 'categoryId' });
Event.belongsTo(Categories, { foreignKey: 'categoryId' });

module.exports = Event;
  