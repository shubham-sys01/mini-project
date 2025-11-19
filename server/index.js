require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const DIGILOCKER_API_KEY = process.env.DIGILOCKER_API_KEY || 'key_live_fa7135b44e824b37a83a1a510128667c';
const DIGILOCKER_API_SECRET = process.env.DIGILOCKER_API_SECRET || 'secret_live_5843da57273945b994de3c37705d1f9c';
const DIGILOCKER_API_VERSION = process.env.DIGILOCKER_API_VERSION || '1.0';
const DIGILOCKER_REDIRECT_URL = process.env.DIGILOCKER_REDIRECT_URL || 'http://localhost:3000/';

// Import routes
const authRoutes = require('./routes/auth');
const recordsRoutes = require('./routes/records');
const sharingRoutes = require('./routes/sharing');
const emergencyRoutes = require('./routes/emergency');

// Initialize express app
const app = express();
const PORT =  8080;

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

app.get('/api/digilocker/session', async (req, res) => {
  try {
    const authHeaders = new Headers();
    authHeaders.append('x-api-key', DIGILOCKER_API_KEY);
    authHeaders.append('x-api-secret', DIGILOCKER_API_SECRET);
    authHeaders.append('x-api-version', DIGILOCKER_API_VERSION);
    console.log("hello")
    const authResponse = await fetch('https://test-api.sandbox.co.in/authenticate', {
      method: 'POST',
      headers: authHeaders,
      redirect: 'follow'
    });

    const authData = await authResponse.json();
    const accessToken = authData?.data?.access_token || authData?.access_token;

    if (!accessToken) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve DigiLocker access token'
      });
    }

    const sessionHeaders = new Headers();
    sessionHeaders.append('Authorization', `${accessToken}`);
    sessionHeaders.append('x-api-key', DIGILOCKER_API_KEY);
    sessionHeaders.append('x-api-version', DIGILOCKER_API_VERSION);
    sessionHeaders.append('Content-Type', 'application/json');

    const payload = {
      '@entity': 'in.co.sandbox.kyc.digilocker.session.request',
      flow: 'signin',
      redirect_url: DIGILOCKER_REDIRECT_URL,
      doc_types: ['aadhaar'],
      options: {
        verification_method: ['aadhaar'],
        pinless: true,
        usernameless: true,
        verified_mobile: '9999999999'
      }
    };
    const raw = JSON.stringify({
      "@entity": "in.co.sandbox.kyc.digilocker.session.request",
      "flow": "signin",
      "redirect_url": DIGILOCKER_REDIRECT_URL,
      "doc_types": ["aadhaar"],
      "options": {
        "verification_method": ["aadhaar"],
        "pinless": true,
        "usernameless": true,
        "verified_mobile": "9999999999"
      }
    });
    const sessionResponse = await fetch('https://api.sandbox.co.in/kyc/digilocker/sessions/init', {
      method: 'POST',
      headers: sessionHeaders,
      body: raw,
      redirect: 'follow'
    });
    console.log(sessionResponse)
    const sessionData = await sessionResponse.json();
    const authorizationUrl = sessionData?.data?.authorization_url || sessionData?.data?.redirect_url;
    const sessionId = sessionData?.data?.session_id || sessionData?.session_id;
    console.log(sessionData)
    if (!authorizationUrl) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create DigiLocker session'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        authorizationUrl,
        session_id: sessionId
      }
    });
  } catch (error) {
    console.error('DigiLocker session error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to initiate DigiLocker session'
    });
  }
});

// DigiLocker callback route - handles redirect after successful login
app.get('/api/digilocker/callback', async (req, res) => {
  try {
    const { session_id, code, state } = req.query;
    
    // If session_id is provided, authenticate the user
    if (session_id) {
      // Return success with session_id - user is authenticated via DigiLocker
      res.status(200).json({
        success: true,
        message: 'DigiLocker authentication successful',
        session_id: session_id,
        user: {
          id: `user-digilocker-${session_id}`,
          name: 'DigiLocker User',
          aadhaarNumber: null
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Missing session_id in callback'
      });
    }
  } catch (error) {
    console.error('DigiLocker callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to process DigiLocker callback',
      error: error.message
    });
  }
});

// Verify session endpoint - used to check if session is valid
app.get('/api/digilocker/verify-session', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.query.session_id;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }
    
    // Simply verify that session_id exists - in production you might want to verify with DigiLocker API
    // For now, we'll just return success if session_id is provided
    res.status(200).json({
      success: true,
      user: {
        id: `user-digilocker-${sessionId}`,
        name: 'DigiLocker User',
        aadhaarNumber: null
      }
    });
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to verify session',
      error: error.message
    });
  }
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