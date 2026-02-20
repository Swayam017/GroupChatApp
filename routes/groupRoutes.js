const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const groupController = require("../controllers/groupController");

router.post("/", authMiddleware, groupController.createGroup);
router.get("/", authMiddleware, groupController.getUserGroups);
router.get("/:groupId/messages", authMiddleware, groupController.getGroupMessages);
router.post("/:groupId/add-member", authMiddleware, groupController.addMember);

module.exports = router;
