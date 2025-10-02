const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const EmergencyAccessSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    default: () => uuidv4(),
    unique: true
  },
  records: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  }],
  emergencyContact: {
    type: String,
    default: ''
  },
  additionalInfo: {
    type: String,
    default: ''
  },
  accessUrl: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  accessLogs: [{
    accessedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    }
  }]
});

module.exports = mongoose.model('EmergencyAccess', EmergencyAccessSchema);