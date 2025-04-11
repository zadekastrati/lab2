const express = require("express");
const app = express();
require('dotenv').config(); 
require('./config/db.js');
const cors = require('cors');
const userRoutes = require('./users/user.routes.js');
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.use(cors({
    origin: 'http://localhost:3000', // adjust this to your frontend URL
    credentials: true
  }));
  ;
  
app.use('/api/users',userRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
