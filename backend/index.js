require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Import routes
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const landsRoutes = require('./routes/lands.routes');
const equipmentRoutes = require('./routes/equipment.routes');
const activitiesRoutes = require('./routes/activities.routes');
const newsRoutes = require('./routes/news.routes');
const orgRoutes = require('./routes/org.routes');
const logsRoutes = require('./routes/logs.routes');

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Farmers Portal API' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/lands', landsRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/logs', logsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
