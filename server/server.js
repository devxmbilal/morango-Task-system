const express = require('express');
const cors = require('cors');
const path = require('path');
const { uploadDir } = require('./middlewares/upload.middleware');
const apiRoutes = require('./routes/index');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// Mount Unified API routes under '/api' prefix
app.use('/api', apiRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
