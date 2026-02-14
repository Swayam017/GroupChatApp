const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name"]
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.findUserByEmail = async (req, res) => {
  const { email } = req.query;

  const user = await User.findOne({
    where: { email },
    attributes: ["id", "name"]
  });

  if (!user) return res.json({});
  res.json(user);
};
