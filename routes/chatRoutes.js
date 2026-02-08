const express = require("express");
const router = express.Router();
const { sendMessage, getMessages } = require("../controllers/chatController");

router.post("/send", sendMessage);
router.get("/:userId/:otherUserId", getMessages);

module.exports = router;
