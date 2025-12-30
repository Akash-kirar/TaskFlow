const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (Placeholders)
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to TaskFlow API' });
});

// app.use('/api/auth', require('./routes/auth.routes'));
// app.use('/api/tasks', require('./routes/task.routes'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;