const { v2: cloudinary } = require('cloudinary');

// Cloudinary supports two ways to configure:
//   1. CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>   (single env var)
//   2. CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET (three env vars)
//
// If neither is set, isConfigured() returns false and the upload middleware
// will fall back to local disk storage so local dev keeps working.

const hasUrl = !!process.env.CLOUDINARY_URL;
const hasTriplet = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

if (hasTriplet && !hasUrl) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else if (hasUrl) {
  // The SDK auto-reads CLOUDINARY_URL on first use; force secure URLs.
  cloudinary.config({ secure: true });
}

function isConfigured() {
  return hasUrl || hasTriplet;
}

module.exports = { cloudinary, isConfigured };
