const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getAllUsers,findUserByEmail  } = require("../controllers/userController");

router.get("/", authMiddleware, getAllUsers);
router.get("/find", authMiddleware, findUserByEmail);

module.exports = router;
