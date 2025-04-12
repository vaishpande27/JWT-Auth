const multer = require('multer');
const path = require('path');

// Local disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const userName = req.body.name?.replace(/\s+/g, '_') || 'user';
    const userId = req.user?.id || 'unknown';
    const ext = path.extname(file.originalname);
    cb(null, `${userName}_${userId}${ext}`);
  }
});

const upload = multer({ storage });

module.exports = upload;
