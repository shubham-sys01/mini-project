const EmergencyAccess = require('../models/EmergencyAccess');
const MedicalRecord = require('../models/MedicalRecord');
const AccessLog = require('../models/AccessLog');
const { v4: uuidv4 } = require('uuid');

// @desc    Generate emergency access token
// @route   POST /api/emergency/token
// @access  Private
exports.generateEmergencyToken = async (req, res) => {
  try {
    const { recordIds, emergencyContact, additionalInfo } = req.body;

    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one record for emergency access'
      });
    }

    // Verify all records belong to the user
    const records = await MedicalRecord.find({
      _id: { $in: recordIds },
      user: req.user.id
    });

    if (records.length !== recordIds.length) {
      return res.status(403).json({
        success: false,
        message: 'You can only include your own records in emergency access'
      });
    }

    // Generate token
    const token = uuidv4();
    const accessUrl = `${req.protocol}://${req.get('host')}/emergency/access/${token}`;

    // Create emergency access
    const emergencyAccess = await EmergencyAccess.create({
      user: req.user.id,
      token,
      records: recordIds,
      emergencyContact: emergencyContact || '',
      additionalInfo: additionalInfo || '',
      accessUrl
    });

    // Mark records as emergency accessible
    await MedicalRecord.updateMany(
      { _id: { $in: recordIds } },
      { isEmergencyAccessible: true }
    );

    // Log access
    await AccessLog.create({
      user: req.user.id,
      accessType: 'emergency',
      accessedBy: req.user.id,
      accessedVia: 'web',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Generated emergency access token for ${recordIds.length} records`
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        accessUrl,
        recordCount: recordIds.length
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all emergency access tokens for a user
// @route   GET /api/emergency/tokens
// @access  Private
exports.getEmergencyAccess = async (req, res) => {
  try {
    const emergencyTokens = await EmergencyAccess.find({ user: req.user.id })
      .populate('records', 'title type date provider')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: emergencyTokens.length,
      data: emergencyTokens
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Revoke emergency access token
// @route   DELETE /api/emergency/token/:tokenId
// @access  Private
exports.revokeEmergencyAccess = async (req, res) => {
  try {
    const emergencyAccess = await EmergencyAccess.findById(req.params.tokenId);

    if (!emergencyAccess) {
      return res.status(404).json({
        success: false,
        message: 'Emergency access token not found'
      });
    }

    // Make sure user owns the token
    if (emergencyAccess.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to revoke this token'
      });
    }

    // Deactivate token
    emergencyAccess.isActive = false;
    await emergencyAccess.save();

    // Log access
    await AccessLog.create({
      user: req.user.id,
      accessType: 'emergency',
      accessedBy: req.user.id,
      accessedVia: 'web',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Revoked emergency access token`
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Access emergency records with a token
// @route   GET /api/emergency/access/:token
// @access  Public
exports.accessEmergencyRecords = async (req, res) => {
  try {
    const emergencyAccess = await EmergencyAccess.findOne({
      token: req.params.token,
      isActive: true
    }).populate('user', 'name');

    if (!emergencyAccess) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired emergency access token'
      });
    }

    // Get records
    const records = await MedicalRecord.find({
      _id: { $in: emergencyAccess.records }
    }).populate('user', 'name');

    // Log access
    const accessLog = {
      accessedAt: Date.now(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    };

    emergencyAccess.accessLogs.push(accessLog);
    await emergencyAccess.save();

    // Create access log entry
    await AccessLog.create({
      user: emergencyAccess.user,
      accessType: 'emergency',
      accessedVia: 'emergency',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Emergency access token used to view ${records.length} records`
    });

    res.status(200).json({
      success: true,
      data: {
        user: emergencyAccess.user,
        emergencyContact: emergencyAccess.emergencyContact,
        additionalInfo: emergencyAccess.additionalInfo,
        records
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get emergency access logs
// @route   GET /api/emergency/logs
// @access  Private
exports.getEmergencyAccessLogs = async (req, res) => {
  try {
    const emergencyTokens = await EmergencyAccess.find({
      user: req.user.id,
      'accessLogs.0': { $exists: true } // Only tokens that have been accessed
    }).sort({ 'accessLogs.accessedAt': -1 });

    // Flatten and format logs
    const logs = [];
    
    emergencyTokens.forEach(token => {
      token.accessLogs.forEach(log => {
        logs.push({
          tokenId: token._id,
          accessedAt: log.accessedAt,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          recordCount: token.records.length
        });
      });
    });

    // Sort by most recent
    logs.sort((a, b) => b.accessedAt - a.accessedAt);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};