const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const AccessLog = require('../models/AccessLog');
const { v4: uuidv4 } = require('uuid');

// @desc    Share a record with another user
// @route   POST /api/share/:recordId
// @access  Private
exports.shareRecord = async (req, res) => {
  try {
    const { email, accessType, expiresAt } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address to share with'
      });
    }

    // Find the record
    const record = await MedicalRecord.findById(req.params.recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    // Make sure user owns the record
    if (record.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to share this record'
      });
    }

    // Find the user to share with
    const shareWithUser = await User.findOne({ email });

    if (!shareWithUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found with that email'
      });
    }

    // Check if already shared with this user
    const alreadyShared = record.sharedWith.some(
      share => share.user.toString() === shareWithUser._id.toString()
    );

    if (alreadyShared) {
      return res.status(400).json({
        success: false,
        message: 'Record already shared with this user'
      });
    }

    // Add to sharedWith array
    record.sharedWith.push({
      user: shareWithUser._id,
      accessType: accessType || 'view',
      expiresAt: expiresAt || null
    });

    record.isShared = true;
    await record.save();

    // Log access
    await AccessLog.create({
      user: req.user.id,
      record: record._id,
      accessType: 'share',
      accessedBy: req.user.id,
      accessedVia: 'web',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Shared record: ${record.title} with user: ${shareWithUser.email}`
    });

    res.status(200).json({
      success: true,
      data: {
        record: record._id,
        sharedWith: shareWithUser.email,
        accessType: accessType || 'view',
        expiresAt: expiresAt || null
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

// @desc    Get all records shared by the user
// @route   GET /api/share/shared-by-me
// @access  Private
exports.getSharedRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({
      user: req.user.id,
      isShared: true
    }).populate('sharedWith.user', 'name email');

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all records shared with the user
// @route   GET /api/share/shared-with-me
// @access  Private
exports.getSharedWithMe = async (req, res) => {
  try {
    const records = await MedicalRecord.find({
      'sharedWith.user': req.user.id
    }).populate('user', 'name email');

    // Filter out expired shares
    const validRecords = records.filter(record => {
      const userShare = record.sharedWith.find(
        share => share.user.toString() === req.user.id
      );
      
      if (!userShare) return false;
      
      // Check if share has expired
      if (userShare.expiresAt && new Date(userShare.expiresAt) < new Date()) {
        return false;
      }
      
      return true;
    });

    res.status(200).json({
      success: true,
      count: validRecords.length,
      data: validRecords
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Revoke access to a shared record
// @route   DELETE /api/share/:recordId/:userId
// @access  Private
exports.revokeAccess = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    // Make sure user owns the record
    if (record.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify sharing for this record'
      });
    }

    // Remove user from sharedWith array
    record.sharedWith = record.sharedWith.filter(
      share => share.user.toString() !== req.params.userId
    );

    // Update isShared flag if no more shares
    if (record.sharedWith.length === 0) {
      record.isShared = false;
    }

    await record.save();

    // Log access
    await AccessLog.create({
      user: req.user.id,
      record: record._id,
      accessType: 'share',
      accessedBy: req.user.id,
      accessedVia: 'web',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Revoked access to record: ${record.title} for user ID: ${req.params.userId}`
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

// @desc    Generate a temporary share link
// @route   POST /api/share/:recordId/link
// @access  Private
exports.generateShareLink = async (req, res) => {
  try {
    const { expiresIn } = req.body; // Time in hours

    const record = await MedicalRecord.findById(req.params.recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    // Make sure user owns the record
    if (record.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to share this record'
      });
    }

    // Generate a unique token
    const shareToken = uuidv4();
    
    // Calculate expiration time (default 24 hours)
    const hours = expiresIn || 24;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(hours));

    // Create share link
    const shareLink = `${req.protocol}://${req.get('host')}/share/${shareToken}`;

    // Store share token in record
    if (!record.shareLinks) {
      record.shareLinks = [];
    }

    record.shareLinks.push({
      token: shareToken,
      expiresAt,
      createdAt: new Date()
    });

    await record.save();

    // Log access
    await AccessLog.create({
      user: req.user.id,
      record: record._id,
      accessType: 'share',
      accessedBy: req.user.id,
      accessedVia: 'web',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Generated share link for record: ${record.title}, expires in ${hours} hours`
    });

    res.status(200).json({
      success: true,
      data: {
        shareLink,
        expiresAt
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