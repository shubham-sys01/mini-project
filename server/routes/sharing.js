const express = require('express');
const router = express.Router();
const { protect, logAccess } = require('../middleware/auth');
const {
  shareRecord,
  getSharedRecords,
  getSharedWithMe,
  revokeAccess,
  generateShareLink
} = require('../controllers/sharing');

// Share a record with another user
router.post('/:recordId', protect, logAccess('share'), shareRecord);

// Get all records shared by the user
router.get('/shared-by-me', protect, getSharedRecords);

// Get all records shared with the user
router.get('/shared-with-me', protect, getSharedWithMe);

// Revoke access to a shared record
router.delete('/:recordId/:userId', protect, revokeAccess);

// Generate a temporary share link
router.post('/:recordId/link', protect, logAccess('share'), generateShareLink);

module.exports = router;