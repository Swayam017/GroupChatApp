const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const aiController = require("../controllers/aiController");

router.post("/predict", authMiddleware, aiController.predictNext);
router.post("/smart-replies", authMiddleware, aiController.smartReplies);

module.exports = router;
