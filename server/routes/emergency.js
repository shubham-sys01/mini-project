const express = require('express');
const router = express.Router();
const { protect, logAccess } = require('../middleware/auth');
const {
  generateEmergencyToken,
  getEmergencyAccess,
  revokeEmergencyAccess,
  accessEmergencyRecords,
  getEmergencyAccessLogs
} = require('../controllers/emergency');

// Generate emergency access token
router.post('/token', protect, logAccess('emergency'), generateEmergencyToken);

// Get all emergency access tokens for a user
router.get('/tokens', protect, getEmergencyAccess);

// Revoke an emergency access token
router.delete('/token/:tokenId', protect, revokeEmergencyAccess);

// Access emergency records with a token (public route)
router.get('/access/:token', logAccess('emergency'), accessEmergencyRecords);

// Get emergency access logs
router.get('/logs', protect, getEmergencyAccessLogs);

module.exports = router;