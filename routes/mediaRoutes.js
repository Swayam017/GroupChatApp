const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  (req, res) => {
    const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;

    res.json({
      url: fileUrl,
      fileType: req.file.mimetype
    });
  }
);

module.exports = router;
