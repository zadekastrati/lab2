const express = require("express");
const app = express();
require('dotenv').config(); 
require('./config/db.js');
const cors = require('cors');
const userRoutes = require('./users/user.routes.js');
const PORT = process.env.PORT || 5000;

// ✅ CORS setup
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
// app.options('*', cors(corsOptions)); // preflight

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
