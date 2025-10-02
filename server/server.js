// Simple server to test
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

// Keep track of logins
const loginHistory = [];

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
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
  const user = {
    id: 'user-001',
    name: 'Demo Patient',
    aadhaarNumber: req.body.aadhaarNumber || '123456789012'
  };
  
  // Record login
  loginHistory.push({
    user: user,
    timestamp: new Date().toISOString(),
    ip: req.ip || 'unknown'
  });
  
  console.log(`User logged in: ${user.name} (Aadhaar: ${user.aadhaarNumber})`);
  
  res.status(200).json({
    success: true,
    message: 'Authentication successful',
    token: 'mock-jwt-token',
    user: user
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

// Add a route to view login history
app.get('/api/admin/login-history', (req, res) => {
  res.status(200).json({
    success: true,
    loginHistory: loginHistory
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Login history available at: http://localhost:${PORT}/api/admin/login-history`);
});