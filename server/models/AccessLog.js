const mongoose = require('mongoose');

const AccessLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  record: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  },
  accessType: {
    type: String,
    enum: ['view', 'download', 'share', 'emergency', 'upload', 'delete'],
    required: true
  },
  accessedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  accessedVia: {
    type: String,
    enum: ['web', 'mobile', 'qr', 'emergency', 'api'],
    default: 'web'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  success: {
    type: Boolean,
    default: true
  },
  details: {
    type: String
  }
});

module.exports = mongoose.model('AccessLog', AccessLogSchema);