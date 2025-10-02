const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure environment variables are loaded
if (!process.env.MAX_FILE_SIZE) {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
}

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use user ID if available, else 'anonymous'
    const userId = req.user && req.user.id ? req.user.id.toString() : 'anonymous';
    const userDir = path.join(uploadDir, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// Allowed extensions and mime types
const allowedExtensions = [
  '.jpeg', '.jpg', '.png', '.gif', '.pdf', '.doc', '.docx',
  '.xls', '.xlsx', '.txt', '.csv', '.ppt', '.pptx'
];
const allowedMimeTypes = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];

// Check file type
const fileFilter = (req, file, cb) => {
  const extname = allowedExtensions.includes(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported. Please upload images, PDFs, or office documents.'));
  }
};

// Parse MAX_FILE_SIZE from environment as integer
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024;

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: maxFileSize }, // Default 10MB
  fileFilter: fileFilter
});

module.exports = upload;