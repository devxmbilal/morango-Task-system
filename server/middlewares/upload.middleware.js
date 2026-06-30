const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary, isConfigured } = require('../config/cloudinary');

// Always set up the local uploads dir — it's still served statically so any
// files uploaded before Cloudinary was wired up continue to work.
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const useCloudinary = isConfigured();

let storage;
if (useCloudinary) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      // Detect resource type: images/videos go to "image"/"video", everything
      // else (pdf, docx, zip, …) uses "raw" so Cloudinary doesn't try to
      // process it as an image.
      const mime = (file.mimetype || '').toLowerCase();
      let resource_type = 'raw';
      if (mime.startsWith('image/')) resource_type = 'image';
      else if (mime.startsWith('video/')) resource_type = 'video';

      const safeName = (file.originalname || 'file')
        .replace(/\.[^/.]+$/, '')          // strip extension
        .replace(/[^a-zA-Z0-9-_]/g, '_')   // sanitize
        .slice(0, 60);

      return {
        folder: process.env.CLOUDINARY_FOLDER || 'morango_tasks',
        resource_type,
        public_id: `${Date.now()}-${safeName}`,
        // keep original filename info so the UI can show it as-is later
      };
    },
  });
  console.log('[upload] Using Cloudinary storage.');
} else {
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) =>
      cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_')),
  });
  console.warn('[upload] CLOUDINARY_URL not set — falling back to local disk. Files will not persist on stateless hosts.');
}

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB per file
});

module.exports = {
  upload,
  uploadDir,
  useCloudinary,
};
