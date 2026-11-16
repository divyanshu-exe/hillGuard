const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist
const uploadDir = path.join(__dirname, '..', 'uploads');
const reportUploadDir = path.join(uploadDir, 'reports');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(reportUploadDir)) fs.mkdirSync(reportUploadDir, { recursive: true });

// Disk storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, reportUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueSuffix = `hg-report-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueSuffix);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Only JPEG, PNG, and WebP are accepted.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter
});

/**
 * Helper to save base64 snapshot string from live camera canvas
 */
const saveBase64Image = (base64String) => {
  if (!base64String || !base64String.includes('base64,')) {
    return null;
  }
  const parts = base64String.split(';base64,');
  const imageType = parts[0].split('/')[1] || 'jpeg';
  const base64Data = parts[1];
  const filename = `live-cam-${Date.now()}-${Math.round(Math.random() * 1e6)}.${imageType === 'jpeg' ? 'jpg' : imageType}`;
  const filepath = path.join(reportUploadDir, filename);

  fs.writeFileSync(filepath, base64Data, 'base64');
  return `/uploads/reports/${filename}`;
};

module.exports = {
  upload,
  saveBase64Image,
  reportUploadDir
};
