const Event = require('../events/event.model');
const sequelize = require('../config/db');

const sampleEvents = [
  {
    name: 'Summer Music Festival',
    photo: 'event-photo-1749329099864.jpg',
    date: '2024-07-15T18:00:00',
    location: 'Hyde Park, London',
    price: 49.99,
    categoryId: 1
  },
  {
    name: 'Tech Innovation Workshop',
    photo: 'event-photo-1749328910461.jpg',
    date: '2024-06-20T10:00:00',
    location: 'Tech Hub, Central London',
    price: 149.99,
    categoryId: 2
  },
  {
    name: 'Food & Wine Festival',
    photo: 'event-photo-1749328816524.jfif',
    date: '2024-08-10T11:00:00',
    location: 'Covent Garden, London',
    price: 75.00,
    categoryId: 3
  },
  {
    name: 'Modern Art Exhibition',
    photo: 'event-photo-1749328777104.jfif',
    date: '2024-09-05T10:00:00',
    location: 'Contemporary Gallery, London',
    price: 25.00,
    categoryId: 4
  },
  {
    name: 'Startup Networking Event',
    photo: 'event-photo-1749328725582.webp',
    date: '2024-06-30T18:30:00',
    location: 'Business Center, Canary Wharf',
    price: 35.00,
    categoryId: 2
  },
  {
    name: 'Cultural Dance Performance',
    photo: 'event-photo-1749328675927.jpg',
    date: '2024-07-25T19:00:00',
    location: 'Royal Opera House, London',
    price: 65.00,
    categoryId: 1
  },
  {
    name: 'Photography Workshop',
    photo: 'event-photo-1749328595892.jpg',
    date: '2024-08-05T14:00:00',
    location: 'Photography Studio, Shoreditch',
    price: 89.99,
    categoryId: 2
  },
  {
    name: 'Wellness and Yoga Retreat',
    photo: 'event-photo-1749328491125.jpg',
    date: '2024-07-01T09:00:00',
    location: 'Zen Garden Center, Richmond',
    price: 120.00,
    categoryId: 3
  }
];

async function addSampleEvents() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    for (const eventData of sampleEvents) {
      // Create the event
      const event = await Event.create({
        name: eventData.name,
        photo: eventData.photo,
        date: eventData.date,
        location: eventData.location,
        price: eventData.price,
        categoryId: eventData.categoryId
      });

      console.log(`Created event: ${event.name}`);
    }

    console.log('All sample events have been added successfully!');
  } catch (error) {
    console.error('Error adding sample events:', error);
  } finally {
    await sequelize.close();
  }
}

addSampleEvents(); 