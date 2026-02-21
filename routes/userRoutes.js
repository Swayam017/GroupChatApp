const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getAllUsers, findUserByEmail } = require("../controllers/userController");
const User = require("../models/User");

// Get all users
router.get("/", authMiddleware, getAllUsers);

// Find user by email
router.get("/find", authMiddleware, findUserByEmail);

// Get logged-in user profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ["id", "name", "email"]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;