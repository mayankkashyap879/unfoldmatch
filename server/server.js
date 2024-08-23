const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/unfoldmatch", { useNewUrlParser: true, })
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes (we'll add these later)
app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/chats', require('./routes/chats'));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('UnfoldMatch API is running');
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;