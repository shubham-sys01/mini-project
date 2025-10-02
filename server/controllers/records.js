const MedicalRecord = require('../models/MedicalRecord');
const File = require('../models/File');
const AccessLog = require('../models/AccessLog');
const fs = require('fs');
const path = require('path');

// @desc    Get all records for a user
// @route   GET /api/records
// @access  Private
exports.getRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ user: req.user.id })
      .sort({ date: -1 });

    // Log access
    await AccessLog.create({
      user: req.user.id,
      accessType: 'view',
      accessedBy: req.user.id,
      accessedVia: 'web',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: 'Viewed all records'
    });

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

// @desc    Get single record
// @route   GET /api/records/:id
// @access  Private
exports.getRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    // Check if user owns the record or has shared access
    const isOwner = record.user.toString() === req.user.id;
    const hasSharedAccess = record.sharedWith.some(
      share => share.user.toString() === req.user.id
    );

    if (!isOwner && !hasSharedAccess && !record.isEmergencyAccessible) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this record'
      });
    }

    // Log access
    await AccessLog.create({
      user: record.user,
      record: record._id,
      accessType: 'view',
      accessedBy: req.user.id,
      accessedVia: 'web',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Viewed record: ${record.title}`
    });

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new record
// @route   POST /api/records
// @access  Private
exports.createRecord = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;

    const record = await MedicalRecord.create(req.body);

    // Log access
    await AccessLog.create({
      user: req.user.id,
      record: record._id,
      accessType: 'upload',
      accessedBy: req.user.id,
      accessedVia: 'web',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Created record: ${record.title}`
    });

    res.status(201).json({
      success: true,
      data: record
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update record
// @route   PUT /api/records/:id
// @access  Private
exports.updateRecord = async (req, res) => {
  try {
    let record = await MedicalRecord.findById(req.params.id);

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
        message: 'Not authorized to update this record'
      });
    }

    record = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Log access
    await AccessLog.create({
      user: req.user.id,
      record: record._id,
      accessType: 'upload',
      accessedBy: req.user.id,
      accessedVia: 'web',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Updated record: ${record.title}`
    });

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete record
// @route   DELETE /api/records/:id
// @access  Private
exports.deleteRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

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
        message: 'Not authorized to delete this record'
      });
    }

    // Delete all files associated with this record
    const files = await File.find({ record: record._id });
    
    for (const file of files) {
      // Delete file from filesystem if it exists
      const filePath = path.join(__dirname, '..', 'uploads', req.user.id, file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Delete file from database
      await file.remove();
    }

    // Delete the record
    await record.remove();

    // Log access
    await AccessLog.create({
      user: req.user.id,
      accessType: 'delete',
      accessedBy: req.user.id,
      accessedVia: 'web',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Deleted record: ${record.title}`
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

// @desc    Upload file to record
// @route   POST /api/records/:id/files
// @access  Private
exports.uploadFile = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

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
        message: 'Not authorized to upload to this record'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Read file data
    const fileData = fs.readFileSync(path.join(req.file.destination, req.file.filename));

    // Create file in database
    const file = await File.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
      user: req.user.id,
      record: record._id,
      data: fileData
    });

    // Add file reference to record
    record.files.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      fileId: file._id
    });

    await record.save();

    // Log access
    await AccessLog.create({
      user: req.user.id,
      record: record._id,
      accessType: 'upload',
      accessedBy: req.user.id,
      accessedVia: 'web',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Uploaded file: ${req.file.originalname} to record: ${record.title}`
    });

    res.status(200).json({
      success: true,
      data: {
        fileId: file._id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size
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

// @desc    Get file
// @route   GET /api/records/:recordId/files/:fileId
// @access  Private
exports.getFile = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    // Check if user has access to this record
    const isOwner = record.user.toString() === req.user.id;
    const hasSharedAccess = record.sharedWith.some(
      share => share.user.toString() === req.user.id
    );

    if (!isOwner && !hasSharedAccess && !record.isEmergencyAccessible) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this file'
      });
    }

    // Find the file
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Log access
    await AccessLog.create({
      user: record.user,
      record: record._id,
      accessType: 'download',
      accessedBy: req.user.id,
      accessedVia: 'web',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Downloaded file: ${file.originalName} from record: ${record.title}`
    });

    // Set response headers
    res.set({
      'Content-Type': file.contentType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
      'Content-Length': file.size
    });

    // Send file data
    res.send(file.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete file
// @route   DELETE /api/records/:recordId/files/:fileId
// @access  Private
exports.deleteFile = async (req, res) => {
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
        message: 'Not authorized to delete files from this record'
      });
    }

    // Find the file
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete file from filesystem if it exists
    const filePath = path.join(__dirname, '..', 'uploads', req.user.id, file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove file reference from record
    record.files = record.files.filter(
      f => f.fileId.toString() !== req.params.fileId
    );
    await record.save();

    // Delete file from database
    await file.remove();

    // Log access
    await AccessLog.create({
      user: req.user.id,
      record: record._id,
      accessType: 'delete',
      accessedBy: req.user.id,
      accessedVia: 'web',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Deleted file: ${file.originalName} from record: ${record.title}`
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