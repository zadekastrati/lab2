const express = require('express');
const cors = require('cors');
const eventRoutes = require('./events/event.routes');

const app = express();

// Enable CORS for frontend
app.use(cors());

// Middleware for parsing JSON bodies
app.use(express.json());

// Routes
app.use('/api/events', eventRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 