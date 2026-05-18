require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const discoveryRoutes = require('./routes/discovery');
app.use('/api/discovery', discoveryRoutes);

// Add this line after: app.use('/api/discovery', discoveryRoutes);

const complianceRoutes = require('./routes/compliance');
app.use('/api/compliance', complianceRoutes);

// Test database connection
db.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('✅ Database connected:', result.rows[0]);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend API working!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL}`);
});