require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const recordsRoutes = require('./routes/records');
const sharingRoutes = require('./routes/sharing');
const emergencyRoutes = require('./routes/emergency');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files directory for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB (commented out for now)
/*
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ayu-connect')
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
*/
console.log('MongoDB connection skipped for development');

// Routes
// Temporarily use simple route handlers for development
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Auth routes
app.post('/api/auth/aadhaar', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OTP sent successfully',
    devOtp: '123456'
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication successful',
    token: 'mock-jwt-token',
    user: {
      id: 'user-001',
      name: 'Demo Patient',
      aadhaarNumber: req.body.aadhaarNumber || '123456789012'
    }
  });
});

app.get('/api/auth/user', (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: 'user-001',
      name: 'Demo Patient',
      aadhaarNumber: '123456789012'
    }
  });
});

// Records routes
app.get('/api/records', (req, res) => {
  res.status(200).json({
    success: true,
    count: 5,
    data: [
      {
        id: 'rec-001',
        type: 'Lab Report',
        title: 'Complete Blood Count (CBC)',
        date: '2023-10-15',
        hospital: 'City General Hospital',
        doctor: 'Dr. Sharma',
        fileUrl: '/mock-data/cbc-report.html',
        thumbnailUrl: '/mock-data/cbc-thumbnail.html'
      },
      {
        id: 'rec-002',
        type: 'Prescription',
        title: 'General Medicine Prescription',
        date: '2023-11-05',
        hospital: 'Apollo Clinic',
        doctor: 'Dr. Patel',
        fileUrl: '/mock-data/prescription.html',
        thumbnailUrl: '/mock-data/prescription.html'
      }
    ]
  });
});

// Emergency routes
app.post('/api/emergency/token', (req, res) => {
  const { recordIds } = req.body;
  const token = `emergency-${recordIds.join(',')}`;
  
  res.status(200).json({
    success: true,
    data: {
      token,
      accessUrl: `http://localhost:3000/emergency/${token}`,
      recordCount: recordIds.length
    }
  });
});

// Uncomment these when MongoDB is set up
// app.use('/api/auth', authRoutes);
// app.use('/api/records', recordsRoutes);
// app.use('/api/share', sharingRoutes);
// app.use('/api/emergency', emergencyRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});