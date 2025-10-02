const express = require('express');
const router = express.Router();
const { protect, logAccess } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  uploadFile,
  getFile,
  deleteFile
} = require('../controllers/records');

// Get all records for the logged-in user
router.get('/', protect, logAccess('view'), getRecords);

// Get a single record
router.get('/:id', protect, logAccess('view'), getRecord);

// Create a new record
router.post('/', protect, logAccess('upload'), createRecord);

// Update a record
router.put('/:id', protect, logAccess('upload'), updateRecord);

// Delete a record
router.delete('/:id', protect, logAccess('delete'), deleteRecord);

// Upload a file to a record
router.post('/:id/files', protect, logAccess('upload'), upload.single('file'), uploadFile);

// Get a file
router.get('/:recordId/files/:fileId', protect, logAccess('download'), getFile);

// Delete a file
router.delete('/:recordId/files/:fileId', protect, logAccess('delete'), deleteFile);

module.exports = router;